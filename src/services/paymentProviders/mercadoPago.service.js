export default function createMercadoPagoProvider(config = {}) {
  // config: { accessToken, webhookKey, sdkInstance, ... }

  return {
    async createPayment({
      templateId,
      amount,
      currency = "CLP",
      buyerEmail,
      buyerName,
      metadata = {},
    } = {}) {
      // TODO: integrar SDK real aquí.
      const paymentId = `mp_${Date.now()}`;
      const checkoutUrl = `https://mercadopago.fake/checkout/${paymentId}`;

      return {
        paymentId,
        checkoutUrl,
        raw: { templateId, amount, currency, metadata },
      };
    },

    /**
     * parseWebhook
     * Recibe datos "puros", sin saber nada de req/res:
     *  - body: payload del webhook (ya parseado)
     *  - headers: headers del webhook
     */
    async parseWebhook(body = {}, headers = {}) {
      // TODO: verificar firma con config.webhookKey y headers si quieres
      const paymentId = body?.data?.id || body?.id || body?.paymentId;

      const status = body?.data?.status || body?.status || "pending";

      return {
        valid: true, // aquí luego puedes poner false si la firma no cuadra
        paymentId,
        status,
        raw: body,
        extra: { headers },
      };
    },

    async refundPayment(paymentId, opts = {}) {
      // TODO: llamar API de refunds real
      return {
        refunded: true,
        refundId: `r_${Date.now()}`,
        raw: { paymentId, opts },
      };
    },

    async getPaymentStatus(paymentId) {
      // TODO: GET estado real en la pasarela
      return {
        paymentId,
        status: "approved",
      };
    },
  };
}
