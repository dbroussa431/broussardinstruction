const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();
const db = admin.firestore();

const PAYPAL_CLIENT_ID = defineSecret("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = defineSecret("PAYPAL_CLIENT_SECRET");
const SMTP_HOST = defineSecret("SMTP_HOST");
const SMTP_PORT = defineSecret("SMTP_PORT");
const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");
const EMAIL_FROM = defineSecret("EMAIL_FROM");
const EMAIL_FROM_NAME = defineSecret("EMAIL_FROM_NAME");
const APP_LOGIN_URL = defineSecret("APP_LOGIN_URL");
const APP_COURSE_NAME = defineSecret("APP_COURSE_NAME");
const APP_COURSE_PRICE = defineSecret("APP_COURSE_PRICE");

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

function maybeOptions(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}

function readConfig() {
  return {
    paypalClientId: PAYPAL_CLIENT_ID.value(),
    paypalClientSecret: PAYPAL_CLIENT_SECRET.value(),
    smtpHost: SMTP_HOST.value(),
    smtpPort: Number(SMTP_PORT.value() || 587),
    smtpUser: SMTP_USER.value(),
    smtpPass: SMTP_PASS.value(),
    emailFrom: EMAIL_FROM.value(),
    emailFromName: EMAIL_FROM_NAME.value() || "Broussard Shooting Academy",
    loginUrl: APP_LOGIN_URL.value() || "https://broussardshootingacademy.com/training/login.html",
    courseName: APP_COURSE_NAME.value() || "Broussard Shooting Academy Online Prerequisite Access",
    coursePrice: APP_COURSE_PRICE.value() || "150.00"
  };
}

function json(res, status, body) {
  setCors(res);
  res.status(status).json(body);
}

async function getPayPalToken(cfg) {
  const creds = Buffer.from(`${cfg.paypalClientId}:${cfg.paypalClientSecret}`).toString("base64");
  const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "Unable to authenticate with PayPal.");
  }
  return data.access_token;
}

function makeCode(name = "BSA") {
  const prefix = String(name).replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 4) || "BSA";
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

async function sendEmail(cfg, email, name, code) {
  const transporter = nodemailer.createTransport({
    host: cfg.smtpHost,
    port: cfg.smtpPort,
    secure: cfg.smtpPort === 465,
    auth: {
      user: cfg.smtpUser,
      pass: cfg.smtpPass
    }
  });

  await transporter.sendMail({
    from: `${cfg.emailFromName} <${cfg.emailFrom}>`,
    to: email,
    subject: "Your BSA student portal access code",
    html: `
      <p>Hello ${name || "Student"},</p>
      <p>Thank you for your purchase from Broussard Shooting Academy.</p>
      <p>Your student portal access code is:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:1px">${code}</p>
      <p>Log in here: <a href="${cfg.loginUrl}">${cfg.loginUrl}</a></p>
      <p>Please keep this code for your records.</p>
      <p>- Broussard Shooting Academy</p>
    `
  });
}

exports.createPayPalOrder = onRequest(
  {
    region: "us-central1",
    secrets: [PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, APP_COURSE_NAME, APP_COURSE_PRICE]
  },
  async (req, res) => {
    if (maybeOptions(req, res)) return;
    if (req.method !== "POST") return json(res, 405, { ok: false, message: "Method not allowed." });

    try {
      const cfg = readConfig();
      const token = await getPayPalToken(cfg);
      const response = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              description: cfg.courseName,
              amount: { currency_code: "USD", value: cfg.coursePrice }
            }
          ],
          application_context: {
            brand_name: "Broussard Shooting Academy",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING"
          }
        })
      });
      const data = await response.json();
      if (!response.ok || !data.id) {
        return json(res, 500, { ok: false, message: "Unable to create PayPal order.", detail: data });
      }
      return json(res, 200, { ok: true, orderID: data.id });
    } catch (error) {
      return json(res, 500, { ok: false, message: error.message });
    }
  }
);

exports.capturePayPalOrder = onRequest(
  {
    region: "us-central1",
    secrets: [
      PAYPAL_CLIENT_ID,
      PAYPAL_CLIENT_SECRET,
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      EMAIL_FROM,
      EMAIL_FROM_NAME,
      APP_LOGIN_URL,
      APP_COURSE_NAME,
      APP_COURSE_PRICE
    ]
  },
  async (req, res) => {
    if (maybeOptions(req, res)) return;
    if (req.method !== "POST") return json(res, 405, { ok: false, message: "Method not allowed." });

    try {
      const cfg = readConfig();
      const orderID = String(req.body?.orderID || "").trim();
      if (!orderID) return json(res, 400, { ok: false, message: "Missing order ID." });

      const existing = await db.collection("paypalOrders").doc(orderID).get();
      if (existing.exists) {
        const data = existing.data();
        return json(res, 200, {
          ok: true,
          alreadyFulfilled: true,
          code: data.code,
          email: data.email,
          emailSent: !!data.emailSent,
          message: "Order already fulfilled."
        });
      }

      const token = await getPayPalToken(cfg);
      const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: "{}"
      });
      const data = await response.json();
      if (!response.ok || data.status !== "COMPLETED") {
        return json(res, 400, { ok: false, message: "Payment was not completed.", detail: data });
      }

      const payer = data.payer || {};
      const name = `${payer?.name?.given_name || ""} ${payer?.name?.surname || ""}`.trim() || "Student";
      const email = String(payer.email_address || data?.payment_source?.paypal?.email_address || "").trim().toLowerCase();
      if (!email) return json(res, 400, { ok: false, message: "No payer email returned by PayPal." });

      const studentLookup = await db.collection("portalStudents").where("email", "==", email).limit(1).get();
      const code = makeCode(name);
      const studentData = {
        name,
        email,
        accessCode: code,
        tier: "FREE",
        paid: true,
        status: "active",
        paymentStatus: "paid",
        paymentMethod: "PayPal",
        course: cfg.courseName,
        price: Number(cfg.coursePrice || 150),
        progress: studentLookup.empty ? {} : (studentLookup.docs[0].data().progress || {}),
        completedLessons: studentLookup.empty ? [] : (studentLookup.docs[0].data().completedLessons || []),
        currentLesson: 1,
        currentStage: "not-started",
        totalQuizTimeSeconds: 0,
        paypalOrderId: orderID,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivityAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (studentLookup.empty) {
        studentData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        await db.collection("portalStudents").add(studentData);
      } else {
        await db.collection("portalStudents").doc(studentLookup.docs[0].id).set(studentData, { merge: true });
      }

      let emailSent = false;
      try {
        await sendEmail(cfg, email, name, code);
        emailSent = true;
      } catch (error) {
        console.error("Email send failed:", error.message);
      }

      await db.collection("paypalOrders").doc(orderID).set({
        email,
        name,
        code,
        emailSent,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return json(res, 200, {
        ok: true,
        code,
        email,
        emailSent,
        message: emailSent ? "Payment complete. The access code was emailed." : "Payment complete. Email failed, so the code is shown below."
      });
    } catch (error) {
      console.error(error);
      return json(res, 500, { ok: false, message: error.message });
    }
  }
);
