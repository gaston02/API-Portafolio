export default function createStripeProvider(config = {}) {
  // config: { apiKey, webhookSecret, sdkInstance, ... }

  return {
    async createPayment({
      templateId,
      amount,
      currency = "CLP",
      buyerEmail,
      buyerName,
      metadata = {}
    } = {}) {

      const paymentId = `st_${Date.now()}`;
      const checkoutUrl = `https://stripe.fake/checkout/${paymentId}`;

      return {
        paymentId,
        checkoutUrl,
        raw: { templateId, amount, currency, metadata }
      };
    },

    async parseWebhook(rawEvent = {}) {
      const body = rawEvent.body || rawEvent;
      const paymentId = body?.data?.object?.id || body?.id || body?.paymentId;
      const status = body?.data?.object?.status || body?.status || "pending";

      return {
        valid: true,
        paymentId,
        status,
        raw: body,
        extra: { headers: rawEvent.headers }
      };
    },

    async refundPayment(paymentId, opts = {}) {
      return {
        refunded: true,
        refundId: `st_ref_${Date.now()}`,
        raw: { paymentId, opts }
      };
    },

    async getPaymentStatus(paymentId) {
      return {
        paymentId,
        status: "approved"
      };
    }
  };
}
