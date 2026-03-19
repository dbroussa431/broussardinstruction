const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const PAYPAL_CLIENT_ID = defineSecret("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = defineSecret("PAYPAL_CLIENT_SECRET");
const PAYPAL_ENV = defineSecret("PAYPAL_ENV");
const SMTP_HOST = defineSecret("SMTP_HOST");
const SMTP_PORT = defineSecret("SMTP_PORT");
const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");
const EMAIL_FROM = defineSecret("EMAIL_FROM");

function getPayPalBase() {
  const env = (PAYPAL_ENV.value() || "sandbox").toLowerCase();
  return env === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID.value()}:${PAYPAL_CLIENT_SECRET.value()}`
  ).toString("base64");

  const response = await fetch(`${getPayPalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "Unable to get PayPal access token.");
  }

  return data.access_token;
}

async function paypalRequest(path, method, body) {
  const token = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalBase()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeName(name) {
  return String(name || "").trim();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

async function generateUniqueCode() {
  for (let i = 0; i < 20; i += 1) {
    const code = `BSA-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const snap = await db
      .collection("portalStudents")
      .where("accessCode", "==", code)
      .limit(1)
      .get();

    if (snap.empty) {
      return code;
    }
  }

  throw new Error("Unable to generate a unique access code.");
}

function makeTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST.value(),
    port: Number(SMTP_PORT.value() || 587),
    secure: Number(SMTP_PORT.value() || 587) === 465,
    auth: {
      user: SMTP_USER.value(),
      pass: SMTP_PASS.value()
    }
  });
}

async function sendCodeEmail({ to, name, accessCode }) {
  const transporter = makeTransporter();

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#142033;">
      <h2 style="margin:0 0 12px;">Broussard Shooting Academy</h2>
      <p>Hello ${name || "Student"},</p>
      <p>Your payment was received and your student portal access code is ready.</p>
      <p style="font-size:18px;font-weight:700;">Access Code: ${accessCode}</p>
      <p>Login here:<br>
      <a href="https://broussardshootingacademy.com/training/login.html">https://broussardshootingacademy.com/training/login.html</a></p>
      <p>If you have any issues, contact Broussard Shooting Academy at 504-289-6605.</p>
    </div>
  `;

  await transporter.sendMail({
    from: EMAIL_FROM.value(),
    to,
    subject: "Your BSA student portal access code",
    html
  });
}

exports.createPayPalOrder = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: [PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENV]
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    try {
      const name = normalizeName(req.body?.name);
      const email = normalizeEmail(req.body?.email);

      if (!name) {
        res.status(400).json({ error: "Full name is required." });
        return;
      }

      if (!validEmail(email)) {
        res.status(400).json({ error: "A valid email address is required." });
        return;
      }

      const orderBody = {
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "BSA Online Prerequisite Access",
            custom_id: JSON.stringify({ name, email }),
            amount: {
              currency_code: "USD",
              value: "150.00"
            }
          }
        ]
      };

      const paypal = await paypalRequest("/v2/checkout/orders", "POST", orderBody);

      if (!paypal.ok || !paypal.data?.id) {
        res.status(500).json({
          error: paypal.data?.message || "Unable to create PayPal order."
        });
        return;
      }

      res.status(200).json({ orderID: paypal.data.id });
    } catch (error) {
      console.error("createPayPalOrder error:", error);
      res.status(500).json({ error: error.message || "Unable to create PayPal order." });
    }
  }
);

exports.capturePayPalOrder = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: [
      PAYPAL_CLIENT_ID,
      PAYPAL_CLIENT_SECRET,
      PAYPAL_ENV,
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      EMAIL_FROM
    ]
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    try {
      const orderID = String(req.body?.orderID || "").trim();
      const postedName = normalizeName(req.body?.name);
      const postedEmail = normalizeEmail(req.body?.email);

      if (!orderID) {
        res.status(400).json({ error: "Missing PayPal order ID." });
        return;
      }

      const existingOrderRef = db.collection("paypalOrders").doc(orderID);
      const existingOrderSnap = await existingOrderRef.get();

      if (existingOrderSnap.exists) {
        const existing = existingOrderSnap.data() || {};
        if (existing.studentId && existing.accessCode) {
          res.status(200).json({
            success: true,
            accessCode: existing.accessCode,
            emailSent: !!existing.emailSent,
            reused: true
          });
          return;
        }
      }

      const capture = await paypalRequest(
        `/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
        "POST"
      );

      if (!capture.ok) {
        res.status(500).json({
          error: capture.data?.message || "Unable to capture PayPal order."
        });
        return;
      }

      const status = capture.data?.status;
      if (status !== "COMPLETED") {
        res.status(400).json({ error: "PayPal order was not completed." });
        return;
      }

      const captureAmount =
        capture.data?.purchase_units?.[0]?.payments?.captures?.[0]?.amount;

      if (
        captureAmount?.currency_code !== "USD" ||
        String(captureAmount?.value) !== "150.00"
      ) {
        res.status(400).json({ error: "Unexpected payment amount." });
        return;
      }

      const payerEmail =
        normalizeEmail(capture.data?.payer?.email_address) || postedEmail;
      const payerName =
        postedName ||
        [
          capture.data?.payer?.name?.given_name,
          capture.data?.payer?.name?.surname
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        "Student";

      if (!validEmail(payerEmail)) {
        res.status(400).json({ error: "Could not determine a valid buyer email." });
        return;
      }

      const accessCode = await generateUniqueCode();

      const studentRef = await db.collection("portalStudents").add({
        name: payerName,
        email: payerEmail,
        accessCode,
        tier: "FULL",
        paid: true,
        status: "active",
        paymentMethod: "PayPal",
        paymentStatus: "Paid",
        portalStatus: "Active",
        course: "Louisiana Concealed Carry",
        price: 150,
        progress: {},
        completedLessons: [],
        lastLoginAt: null,
        lastActivityAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        purchaseOrderId: orderID,
        codeIssuedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      let emailSent = false;
      try {
        await sendCodeEmail({
          to: payerEmail,
          name: payerName,
          accessCode
        });
        emailSent = true;
      } catch (mailError) {
        console.error("Email send failed:", mailError);
      }

      await existingOrderRef.set(
        {
          orderID,
          studentId: studentRef.id,
          accessCode,
          buyerEmail: payerEmail,
          buyerName: payerName,
          emailSent,
          capturedAt: admin.firestore.FieldValue.serverTimestamp(),
          amount: 150,
          currency: "USD"
        },
        { merge: true }
      );

      res.status(200).json({
        success: true,
        accessCode,
        emailSent
      });
    } catch (error) {
      console.error("capturePayPalOrder error:", error);
      res.status(500).json({ error: error.message || "Unable to complete purchase." });
    }
  }
);
