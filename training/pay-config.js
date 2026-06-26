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
 *                       (DISPLAY + student record only — the actual amount
 *                        charged is fixed inside the PayPal payment link)
 *   currency          — ISO 4217 code (e.g. "USD")
 *   manualPayPalMeUrl — your PayPal business payment link (amount baked in)
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

  /**
   * PayPal BUSINESS payment link (PayPal "Payment Link" / ncp checkout).
   * This link type lets buyers pay with PayPal OR a debit/credit card as a
   * guest (no PayPal account required).
   *
   * IMPORTANT: the amount is fixed inside this link on PayPal's side — do
   * NOT append the price to it (that would break the link). To change the
   * price, create a new payment link in your PayPal business dashboard and
   * paste it here, then update `price` above so the displayed amount and
   * the saved student record match what the link charges.
   */
  var paymentLinkUrl = "https://www.paypal.com/ncp/payment/DW3LDEGKBE85J";

  /**
   * PayPal JavaScript SDK Client ID (PUBLIC — safe to expose in the browser).
   * Used by purchase.html to render the on-page Pay buttons that report
   * payment completion so the access code can be created instantly.
   *
   * ⚠ This is currently your SANDBOX client ID (for testing). When you're
   * ready for real payments, go to developer.paypal.com → switch to LIVE →
   * your "BSA WEBSITE" app → copy the LIVE Client ID and paste it here,
   * then set payPalEnv to "live".
   *
   * NEVER put the Secret key here — the browser never needs it.
   */
  var payPalClientId =
    "Ac2cNxCwlVaH1l_t0ohmJ3b1N-IPvBzJqQyK5OcXej3XFCH3hd4LXuIzHaYeilDLwb1DGK2NtDpzlLDP";
  var payPalEnv = "sandbox"; // "sandbox" while testing, "live" for real money

  window.BSA_PAY_CONFIG = Object.freeze({

    /** Human-readable course name shown on purchase page */
    courseName: "Broussard Shooting Academy",

    /** Course price in dollars (numeric, no currency symbol) */
    coursePrice: price,

    /** ISO 4217 currency code */
    currency: "USD",

    /** Contact email shown to students who need help */
    supportEmail: "BroussardShootingAcademy@protonmail.com",

    /** Contact phone shown to students who need help */
    supportPhone: "504-289-6605",

    /**
     * PayPal business payment link (amount baked in on PayPal's side).
     * Supports card/guest checkout as well as PayPal balance.
     * NOTE: This URL is visible in page source to any visitor — expected
     * and safe for a hosted PayPal payment link.
     */
    manualPayPalMeUrl: paymentLinkUrl,

    /** PayPal SDK Client ID (public) — used for the on-page Pay buttons. */
    payPalClientId: payPalClientId,

    /** "sandbox" (testing) or "live" (real payments). */
    payPalEnv: payPalEnv,

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
