export default function createPaypalProvider(config = {}) {
  // config: { clientId, clientSecret, webhookId, sdkInstance, ... }

  return {
    async createPayment({
      templateId,
      amount,
      currency = "CLP",
      buyerEmail,
      buyerName,
      metadata = {},
    } = {}) {
      const paymentId = `pp_${Date.now()}`;
      const checkoutUrl = `https://paypal.fake/checkout/${paymentId}`;

      return {
        paymentId,
        checkoutUrl,
        raw: { templateId, amount, currency, metadata },
      };
    },

    // Versión limpia: sin rawEvent, recibe body y headers directo
    async parseWebhook(body = {}, headers = {}) {
      // En PayPal real, casi siempre viene en body.resource
      const paymentId =
        body?.resource?.id ||
        body?.id ||
        body?.paymentId;

      const status =
        body?.resource?.status ||
        body?.status ||
        "pending";

      return {
        valid: true,       // luego aquí puedes usar config.webhookId y headers para validar firma
        paymentId,
        status,
        raw: body,
        extra: { headers },
      };
    },

    async refundPayment(paymentId, opts = {}) {
      return {
        refunded: true,
        refundId: `pp_ref_${Date.now()}`,
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
