window.BSA_PAY_CONFIG = {
  // 🔴 REQUIRED — REPLACE THIS WITH YOUR REAL PAYPAL LIVE CLIENT ID
  paypalClientId: "AXA3pfi5Xw9XYJCftXrScMroVnGMhmDfxbZkQL8BWm5n5y0Ivolgd9TMms7mfWEvSMDQUbka4Hz7A_rc",

  // 💰 PRODUCT INFO
  courseName: "BSA Online Prerequisite Access",
  coursePrice: 150,
  currency: "USD",

  // 📞 SUPPORT INFO
  supportEmail: "BroussardShootingAcademy@protonmail.com",
  supportPhone: "504-289-6605",

  // 🔗 NAVIGATION
  loginUrl: "https://broussardshootingacademy.com/training/login.html",
  purchaseUrl: "https://broussardshootingacademy.com/training/purchase.html",

  // 💸 BACKUP PAYMENT LINK (ALWAYS KEEP THIS)
  manualPayPalMeUrl: "https://www.paypal.com/paypalme/dbroussa431/150",

  // ⚙️ BACKEND ENDPOINTS (YOUR CLOUD FUNCTIONS)
  createOrderUrl: "https://createpaypalorder-fprfvzkihq-uc.a.run.app",
  captureOrderUrl: "https://us-central1-bsa-training-admin.cloudfunctions.net/capturePayPalOrder",

  // 🛡️ SAFETY FLAGS (NEW — prevents silent failures)
  environment: "production", // or "sandbox"
  debug: true
};
