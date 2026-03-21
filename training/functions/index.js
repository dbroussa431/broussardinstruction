const { onRequest } = require("firebase-functions/v2/https");

/* =========================
   CREATE PAYPAL ORDER
========================= */
exports.createPayPalOrder = onRequest(
  {
    cors: [
      "https://broussardshootingacademy.com",
      "https://www.broussardshootingacademy.com"
    ]
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { name, email } = req.body || {};

      if (!name || !email) {
        return res.status(400).json({ error: "Missing buyer info." });
      }

      // TEMP test response (we’ll wire real PayPal next)
      return res.json({
        orderID: "TEST_" + Date.now()
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create order." });
    }
  }
);


/* =========================
   CAPTURE PAYPAL ORDER
========================= */
// 👇 KEEP YOUR EXISTING ONE HERE
exports.capturePayPalOrder = onRequest(
  {
    cors: [
      "https://broussardshootingacademy.com",
      "https://www.broussardshootingacademy.com"
    ]
  },
  async (req, res) => {
    try {
      // your existing logic here
      return res.json({
        success: true,
        accessCode: "BSA-TEST-1234",
        emailSent: true
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Capture failed." });
    }
  }
);
