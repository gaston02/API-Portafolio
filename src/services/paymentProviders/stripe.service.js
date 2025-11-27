// services/paymentProviders/stripe.service.js
export default function createStripeProvider(config = {}) {
  // config: { apiKey, webhookSecret, sdkInstance, ... }

  return {
    async createPayment({
      templateId,
      amount,
      currency = "CLP",
      buyerEmail,
      buyerName,
      metadata = {},
    } = {}) {
      const paymentId = `st_${Date.now()}`;
      const checkoutUrl = `https://stripe.fake/checkout/${paymentId}`;

      return {
        paymentId,
        checkoutUrl,
        raw: { templateId, amount, currency, metadata },
      };
    },

    // Versión limpia: recibe body y headers por separado
    async parseWebhook(body = {}, headers = {}) {
      // Stripe real manda: body.data.object.id
      const paymentId = body?.data?.object?.id || body?.id || body?.paymentId;

      const status = body?.data?.object?.status || body?.status || "pending";

      return {
        valid: true, // luego puedes validar firma usando config.webhookSecret + headers
        paymentId,
        status,
        raw: body,
        extra: { headers },
      };
    },

    async refundPayment(paymentId, opts = {}) {
      return {
        refunded: true,
        refundId: `st_ref_${Date.now()}`,
        raw: { paymentId, opts },
      };
    },

    async getPaymentStatus(paymentId) {
      return {
        paymentId,
        status: "approved",
      };
    },
  };
}
