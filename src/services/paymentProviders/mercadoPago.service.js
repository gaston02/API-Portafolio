export default function createMercadoPagoProvider(config = {}) {
  // config: { accessToken, webhookKey, sdkInstance, ... }
  return {
    async createPayment({ templateId, amount, currency = "CLP", buyerEmail, buyerName, metadata = {} } = {}) {
      // TODO: integrar SDK real aquí.
      // Debe devolver al menos { paymentId, checkoutUrl?, raw? }
      const paymentId = `mp_${Date.now()}`;
      const checkoutUrl = `https://mercadopago.fake/checkout/${paymentId}`;
      return { paymentId, checkoutUrl, raw: { templateId, amount, currency, metadata } };
    },

    async parseWebhook(rawEvent = {}) {
      // rawEvent: { body, headers } (como venga de Express/Fastify)
      // TODO: verificar firma con webhookKey
      const body = rawEvent.body || rawEvent;
      const paymentId = body?.data?.id || body?.id || body?.paymentId;
      const status = body?.data?.status || body?.status || "pending";
      return { valid: true, paymentId, status, raw: body, extra: { headers: rawEvent.headers } };
    },

    async refundPayment(paymentId, opts = {}) {
      // TODO: llamar API de refunds
      return { refunded: true, refundId: `r_${Date.now()}`, raw: { paymentId, opts } };
    },

    async getPaymentStatus(paymentId) {
      // TODO: GET estado real
      return { paymentId, status: "approved" };
    }
  };
}
