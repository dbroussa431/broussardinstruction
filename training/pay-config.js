/**
 * BSA Payment Configuration
 * =============================================================
 * Loaded as a classic <script> before any ES modules so that
 * window.BSA_PAY_CONFIG is available synchronously.
 *
 * SECURITY NOTE:
 * This file is served to every browser that loads purchase.html.
 * Do NOT place Firebase service account keys, admin secrets, or
 * anything that should stay server-side in this file.
 *
 * The Cloud Function endpoints below must enforce their own
 * Firebase Auth token validation server-side — exposure of the
 * URL alone does not grant access if the functions are properly
 * secured.
 *
 * EDITING GUIDE:
 *   coursePrice       — numeric dollar amount, no $ sign (e.g. 150)
 *   currency          — ISO 4217 code (e.g. "USD")
 *   manualPayPalMeUrl — your PayPal.Me link including the amount
 *   createOrderUrl    — Cloud Function for PayPal order creation
 *   captureOrderUrl   — Cloud Function for PayPal order capture
 *   env               — "production" | "development"
 *                       swap to development for sandbox/staging testing
 * =============================================================
 */

(function () {
  "use strict";

  /** @type {number} Course price in dollars — must be a positive finite number */
  var price = 150;

  // Validate price before exposing it — prevents NaN from reaching Firestore
  if (typeof price !== "number" || !isFinite(price) || price <= 0) {
    console.error("BSA pay-config: coursePrice is invalid. Defaulting to 150.");
    price = 150;
  }

  window.BSA_PAY_CONFIG = Object.freeze({

    /** Human-readable course name shown on purchase page */
    courseName: "BSA Online Prerequisite Access",

    /** Course price in dollars (numeric, no currency symbol) */
    coursePrice: price,

    /** ISO 4217 currency code */
    currency: "USD",

    /** Contact email shown to students who need help */
    supportEmail: "BroussardShootingAcademy@protonmail.com",

    /** Contact phone shown to students who need help */
    supportPhone: "504-289-6605",

    /**
     * PayPal.Me manual payment link.
     * NOTE: This URL is visible in page source to any visitor.
     * This is unavoidable with a client-side PayPal.Me flow.
     */
    manualPayPalMeUrl: "https://www.paypal.com/paypalme/dbroussa431/150",

    /**
     * Firebase Cloud Function: creates a PayPal order.
     * Must validate Firebase Auth token server-side before processing.
     * Currently unused by purchase.html — reserved for PayPal SDK integration.
     */
    createOrderUrl: "https://us-central1-bsa-training-admin.cloudfunctions.net/createPayPalOrder",

    /**
     * Firebase Cloud Function: captures an approved PayPal order.
     * Must validate Firebase Auth token server-side before processing.
     * Currently unused by purchase.html — reserved for PayPal SDK integration.
     */
    captureOrderUrl: "https://us-central1-bsa-training-admin.cloudfunctions.net/capturePayPalOrder",

    /**
     * Environment flag.
     * Switch to "development" when testing against a staging Firebase
     * project or a PayPal sandbox account.
     */
    env: "production"

  });

})();
