/**
 * BSA PayPal Cloud Functions
 * =============================================================
 * Replaces the previous TEST stubs with REAL PayPal REST API calls.
 *
 * What changed vs. the old stubs:
 *   - createPayPalOrder  : was returning a fake "TEST_..." id.
 *                          Now creates a REAL PayPal order for the course price.
 *   - capturePayPalOrder : was returning a hardcoded "BSA-TEST-1234" and a
 *                          fake "emailSent: true".
 *                          Now captures the REAL payment, generates a real
 *                          access code (same format as the admin dashboard),
 *                          writes a real `portalStudents` record (same shape
 *                          as the admin "Add Student"), and returns the code
 *                          so the page can show it to the buyer immediately.
 *
 * IMPORTANT — student gets their code ON SCREEN right after paying. No email
 * dependency. (Email delivery can be added later once we have the
 * sendManualEmail function source; on-screen delivery works on its own.)
 *
 * The admin dashboard is untouched and still works as your manual fallback.
 * =============================================================
 *
 * BEFORE THIS WORKS — you must do three things (instructions at the bottom):
 *   1. Set PayPal API credentials as Firebase secrets.
 *   2. Choose sandbox vs. live with PAYPAL_LIVE below.
 *   3. Deploy:  firebase deploy --only functions
 * =============================================================
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

// ── Firestore (admin SDK) ─────────────────────────────────────────────
admin.initializeApp();
const db = admin.firestore();

// ── PayPal credentials (stored as Firebase secrets, never in code) ────
const PAYPAL_CLIENT_ID = defineSecret("PAYPAL_CLIENT_ID");
const PAYPAL_SECRET = defineSecret("PAYPAL_SECRET");

// ── Settings ──────────────────────────────────────────────────────────
// Flip to true ONLY after you've tested in sandbox and are ready for real money.
const PAYPAL_LIVE = false;
const PAYPAL_BASE = PAYPAL_LIVE
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

const COURSE_PRICE = "150.00";          // must be a string with 2 decimals
const COURSE_CURRENCY = "USD";
const COURSE_NAME = "Broussard Shooting Academy";

const ALLOWED_ORIGINS = [
  "https://broussardshootingacademy.com",
  "https://www.broussardshootingacademy.com",
];

// ── Helpers ───────────────────────────────────────────────────────────

// Access code in the EXACT format the admin dashboard uses:
//   BSA-{TIER}-{NAME4}-{1234}   e.g. BSA-FULL-JOHN-4821
function generateAccessCode(tier = "FULL", name = "") {
  const prefix = `BSA-${tier}`;
  const cleanName =
    (name || "STUDENT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) ||
    "STUD";
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${cleanName}-${random}`;
}

// Get a short-lived PayPal OAuth token using your REST credentials.
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID.value()}:${PAYPAL_SECRET.value()}`
  ).toString("base64");

  const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`PayPal auth failed (${resp.status}): ${text}`);
  }
  const data = await resp.json();
  return data.access_token;
}

// Build the full student record — identical shape to admin.js "Add Student",
// plus provenance fields so you can see it came from automated PayPal.
function buildStudentRecord({ name, email, accessCode, orderId, captureId }) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  return {
    name: name || "",
    email: (email || "").trim().toLowerCase(),
    course: COURSE_NAME,
    price: Number(COURSE_PRICE),
    paymentMethod: "PayPal",
    paymentStatus: "paid",
    paid: true,
    portalStatus: "active",
    status: "active",
    accessCode,
    createdAt: now,
    updatedAt: now,
    completedLessons: [],
    progress: {},
    totalQuizTimeSeconds: 0,
    lastLoginAt: null,
    lastEmailType: null,
    lastEmailSentAt: null,
    lastEmail7At: null,
    lastEmail14At: null,
    lastEmail30At: null,
    inactiveEmailSent7: false,
    inactiveEmailSent14: false,
    inactiveEmailSent30: false,
    // provenance (lets you tell auto sign-ups apart from manual ones)
    source: "paypal-auto",
    paypalOrderId: orderId || null,
    paypalCaptureId: captureId || null,
  };
}

// =====================================================================
// CREATE PAYPAL ORDER
// Called by the PayPal SDK buttons on the purchase page to start checkout.
// =====================================================================
exports.createPayPalOrder = onRequest(
  { cors: ALLOWED_ORIGINS, secrets: [PAYPAL_CLIENT_ID, PAYPAL_SECRET] },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const token = await getPayPalAccessToken();

      const orderResp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              description: COURSE_NAME,
              amount: {
                currency_code: COURSE_CURRENCY,
                value: COURSE_PRICE,
              },
            },
          ],
        }),
      });

      const order = await orderResp.json();
      if (!orderResp.ok) {
        console.error("Create order failed:", order);
        return res.status(502).json({ error: "Could not create PayPal order." });
      }

      return res.json({ orderID: order.id });
    } catch (err) {
      console.error("createPayPalOrder error:", err);
      return res.status(500).json({ error: "Failed to create order." });
    }
  }
);

// =====================================================================
// CAPTURE PAYPAL ORDER
// Called after the buyer approves. Captures the money, then provisions
// the student: real access code + real portalStudents record.
// =====================================================================
exports.capturePayPalOrder = onRequest(
  { cors: ALLOWED_ORIGINS, secrets: [PAYPAL_CLIENT_ID, PAYPAL_SECRET] },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { orderID } = req.body || {};
      if (!orderID) {
        return res.status(400).json({ error: "Missing orderID." });
      }

      // ── Idempotency: if we already provisioned this order, return its code.
      // Prevents duplicate students / duplicate codes on retries or refreshes.
      const existing = await db
        .collection("portalStudents")
        .where("paypalOrderId", "==", orderID)
        .limit(1)
        .get();
      if (!existing.empty) {
        const doc = existing.docs[0].data();
        return res.json({
          success: true,
          alreadyProcessed: true,
          accessCode: doc.accessCode,
        });
      }

      // ── Capture the real payment.
      const token = await getPayPalAccessToken();
      const capResp = await fetch(
        `${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const capture = await capResp.json();
      if (!capResp.ok || capture.status !== "COMPLETED") {
        console.error("Capture failed:", capture);
        return res
          .status(502)
          .json({ error: "Payment was not completed.", details: capture.status || null });
      }

      // ── Pull buyer info from the verified PayPal response (not the client).
      const payer = capture.payer || {};
      const payerName = [
        payer.name?.given_name,
        payer.name?.surname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const payerEmail = payer.email_address || "";
      const captureId =
        capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

      // ── Provision the student.
      const accessCode = generateAccessCode("FULL", payerName);
      const record = buildStudentRecord({
        name: payerName,
        email: payerEmail,
        accessCode,
        orderId: orderID,
        captureId,
      });
      await db.collection("portalStudents").add(record);

      // Code is returned for immediate ON-SCREEN display to the buyer.
      return res.json({
        success: true,
        accessCode,
        email: payerEmail,
        name: payerName,
      });
    } catch (err) {
      console.error("capturePayPalOrder error:", err);
      return res.status(500).json({ error: "Capture failed." });
    }
  }
);

/* =====================================================================
   DEPLOY INSTRUCTIONS  (run from your `functions` folder)
   =====================================================================

   1) Get your PayPal REST API credentials:
      developer.paypal.com → Apps & Credentials
        • "Sandbox" tab  → create/copy a Client ID + Secret for testing
        • "Live" tab     → copy your real Client ID + Secret for production

   2) Store them as Firebase secrets (you'll be prompted to paste each value):
        firebase functions:secrets:set PAYPAL_CLIENT_ID
        firebase functions:secrets:set PAYPAL_SECRET
      (Start with the SANDBOX credentials while PAYPAL_LIVE = false above.)

   3) Deploy:
        firebase deploy --only functions

   4) TEST in sandbox first (PAYPAL_LIVE = false):
        - Use a PayPal sandbox buyer account to run a full payment.
        - Confirm a new `portalStudents` record appears in Firestore with a
          real BSA-FULL-...-#### code, paid:true, portalStatus:"active".
        - Confirm you can log in with that email + code.

   5) GO LIVE only after sandbox works:
        - Set PAYPAL_LIVE = true above.
        - Re-set the two secrets with your LIVE credentials (steps 2).
        - Redeploy (step 3).

   NOTE: These functions are only called when the purchase page uses PayPal
   SDK buttons. Your current page uses a hosted payment link, which does NOT
   call them. Once these are deployed and tested, we switch the page over to
   the SDK buttons. Until then, nothing on your live site changes.
   ===================================================================== */
