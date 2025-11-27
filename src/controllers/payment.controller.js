import {
  createPaymentIntent,
  handleWebhook,
  refundPayment,
} from "../services/paymentService.js";

const SUPPORTED_PROVIDERS = ["mercadopago", "stripe", "paypal"];

export async function createPaymentController(req, res) {
  try {
    const purchasePayload = {
      templateId: req.body.templateId,
      providerName: req.body.provider, // 'mercadopago' | 'stripe' | 'paypal'
      buyerEmail: req.body.buyerEmail,
      buyerName: req.body.buyerName,
      buyerIp: req.ip, // opcional, si te interesa
      amount: req.body.amount, // opcional, tu service valida contra template
      currency: req.body.currency || "CLP",
      metadata: req.body.metadata, // opcional
    };

    const { purchase, providerResponse } = await createPaymentIntent(
      purchasePayload
    );

    return res.status(201).json({
      message: "Intento de pago creado con éxito",
      purchase,
      checkoutUrl: providerResponse.checkoutUrl || null,
      providerResponse,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

export async function genericWebhookController(req, res) {
  try {
    const providerName = String(req.params.provider || "").toLowerCase();

    if (!SUPPORTED_PROVIDERS.includes(providerName)) {
      return res.status(400).send(`Provider no soportado: ${providerName}`);
    }

    // En la mayoría de los casos: body JSON + headers
    const body = req.body;
    const headers = req.headers;

    await handleWebhook(providerName, { body, headers });

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook genérico:", error.message);
    return res.status(400).send(error.message);
  }
}

export async function refundPaymentController(req, res) {
  try {
    const providerName = req.params.provider; // 'mercadopago'|'stripe'|'paypal'
    const paymentId = req.params.paymentId;

    // Podrías permitir body con razón, monto parcial, etc.
    const refundOpts = {
      amount: req.body.amount, // opcional
      reason: req.body.reason, // opcional
    };

    const resp = await refundPayment(providerName, paymentId, refundOpts);

    return res.status(200).json({
      message: "Refund procesado",
      refund: resp,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}
