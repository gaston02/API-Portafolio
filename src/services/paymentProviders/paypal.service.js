export default function createPaypalProvider(config = {}) {
  // config: { clientId, clientSecret, webhookId, sdkInstance, ... }

  return {
    async createPayment({
      templateId,
      amount,
      currency = "CLP",
      buyerEmail,
      buyerName,
      metadata = {}
    } = {}) {

      const paymentId = `pp_${Date.now()}`;
      const checkoutUrl = `https://paypal.fake/checkout/${paymentId}`;

      return {
        paymentId,
        checkoutUrl,
        raw: { templateId, amount, currency, metadata }
      };
    },

    async parseWebhook(rawEvent = {}) {
      const body = rawEvent.body || rawEvent;
      const paymentId = body?.resource?.id || body?.id || body?.paymentId;
      const status = body?.resource?.status || body?.status || "pending";

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
        refundId: `pp_ref_${Date.now()}`,
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
