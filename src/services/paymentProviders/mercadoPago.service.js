import { MercadoPagoConfig, Preference } from "mercadopago";
import { ACCESS_TOKEN } from "../../config.js";

export default function createMercadoPagoProvider(config = {}) {
  // Cliente oficial MercadoPago
  const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

  return {
    async createPayment({
      templateId,
      amount,
      currency = "CLP",
      buyerEmail,
      buyerName,
      metadata = {},
    } = {}) {
      // 1) Crear instancia de Preferencias (checkout)
      const preference = new Preference(client);

      // 2) Construir body REAL para MercadoPago
      const response = await preference.create({
        body: {
          items: [
            {
              id: templateId,
              title: metadata.title || "Compra de template",
              quantity: 1,
              unit_price: amount,
              currency_id: currency,
            },
          ],
          payer: {
            email: buyerEmail,
            name: buyerName,
          },
          back_urls: {
            success: config.successUrl || "https://tu-frontend.com/success",
            failure: config.failureUrl || "https://tu-frontend.com/failure",
            pending: config.pendingUrl || "https://tu-frontend.com/pending",
          },
          auto_return: "approved",
          notification_url:
            config.notificationUrl ||
            "https://fa12-89ab-1234.ngrok-free.app/api/webhooks/mercadopago",

          metadata: {
            templateId,
            buyerEmail,
            ...metadata,
          },
        },
      });

      // 3) Extraer datos útiles
      const paymentId = response.id;
      const checkoutUrl = response.init_point || response.sandbox_init_point;

      return {
        paymentId,
        checkoutUrl,
        raw: response,
      };
    },

    async parseWebhook(body = {}, headers = {}) {
      const paymentId = body?.data?.id || body?.id;
      const status = body?.data?.status || "pending";

      return {
        valid: true,
        paymentId,
        status,
        raw: body,
        extra: { headers },
      };
    },

    async refundPayment(paymentId) {
      return {
        refunded: true,
        refundId: `r_${Date.now()}`,
        raw: { paymentId },
      };
    },

    async getPaymentStatus(paymentId) {
      return { paymentId, status: "approved" };
    },
  };
}
