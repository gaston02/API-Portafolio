import providerFactory from "./providerFactory.js";
import * as purchaseService from "./purchaseService.js";

/**
 * createPaymentIntent
 * - Orquesta: crea intento en provider y guarda Purchase (idempotente).
 *
 * purchasePayload: {
 *   templateId,
 *   providerName,   // 'mercadopago'|'stripe'|'paypal'|...
 *   buyerEmail?,
 *   buyerName?,
 *   buyerIp?,
 *   amount?         // opcional: service de purchase validará/confirmará contra template
 *   currency?
 *   metadata?       // opcional, se pasa al provider
 * }
 *
 * opts: { factory = providerFactory, purchaseSvc = purchaseService, session = null }
 *
 * Retorna: { purchase, providerResponse }
 */
export async function createPaymentIntent(
  purchasePayload = {},
  {
    factory = providerFactory,
    purchaseSvc = purchaseService,
    session = null,
  } = {}
) {
  try {
    const { providerName } = purchasePayload;
    if (!providerName) throw new Error("providerName es requerido.");

    // obtener adapter (puede inicializar SDK con keys internas)
    const provider = factory(providerName);
    if (!provider) throw new Error(`Provider no configurado: ${providerName}`);

    // 1) crear pago en la pasarela (adapter debe devolver al menos paymentId)
    //    provider.createPayment debe ser idempotente y aceptar metadata/idempotencyKey cuando aplique
    const providerResponse = await provider.createPayment(purchasePayload);

    if (!providerResponse || !providerResponse.paymentId) {
      throw new Error("Respuesta inválida del proveedor: falta paymentId.");
    }

    // 2) crear registro Purchase en BD usando tu purchaseService (idempotente por paymentId)
    //    Pasamos providerResponse para auditoría; purchaseService retornará existente si ya existe
    const createdPurchase = await purchaseSvc.createPurchase(
      {
        templateId: purchasePayload.templateId,
        paymentId: providerResponse.paymentId,
        provider: providerName,
        amount: purchasePayload.amount,
        currency: purchasePayload.currency,
        buyerEmail: purchasePayload.buyerEmail,
        buyerName: purchasePayload.buyerName,
        buyerIp: purchasePayload.buyerIp,
        providerResponse,
      },
      { session }
    );

    return { purchase: createdPurchase, providerResponse };
  } catch (error) {
    throw new Error(`Error en createPaymentIntent: ${error.message}`);
  }
}

/**
 * handleWebhook
 * - Recibe el raw event (body + headers), lo delega al provider.parseWebhook para validar/firmear,
 *   mapea estado y actualiza Purchase (usando purchaseService.updatePurchaseByPaymentId).
 *
 * rawEvent: { body, headers } (o lo que el adapter espere)
 * opts: { factory = providerFactory, purchaseSvc = purchaseService, logger = console }
 *
 * Retorna: purchase actualizado
 */
export async function handleWebhook(
  providerName,
  { body = {}, headers = {} } = {},
  {
    factory = providerFactory,
    purchaseSvc = purchaseService,
    logger = console,
  } = {}
) {
  try {
    if (!providerName) throw new Error("providerName es requerido.");

    const provider = factory(providerName);
    if (!provider) throw new Error(`Provider no encontrado: ${providerName}`);

    // Aquí ya NO pasamos rawEvent, sino body y headers separados
    const parsed = await provider.parseWebhook(body, headers);

    if (!parsed || parsed.valid !== true) {
      throw new Error("Webhook inválido o no verificado.");
    }

    const { paymentId, status, raw, extra } = parsed;
    if (!paymentId) throw new Error("Webhook parseado sin paymentId.");

    const mappedStatus = mapProviderStatusToLocal(status);

    const update = {
      status: mappedStatus,
      $set: {
        providerRaw: raw || null,
        providerStatus: status,
        providerExtra: extra || null,
      },
    };

    const updated = await purchaseSvc.updatePurchaseByPaymentId(
      paymentId,
      update
    );

    if (updated && mappedStatus === "approved") {
      logger.info(`Pago aprobado: ${paymentId}`);
      // aquí podrías disparar mail, link de descarga, etc.
    }

    return updated;
  } catch (error) {
    throw new Error(`Error en handleWebhook: ${error.message}`);
  }
}

/**
 * refundPayment
 * - Solicita refund al provider y, si confirma, marca la purchase como refunded.
 *
 * params: providerName, paymentId, opts (cantidad parcial, reason...)
 * retorna: respuesta del provider
 */
export async function refundPayment(
  providerName,
  paymentId,
  refundOpts = {},
  { factory = providerFactory, purchaseSvc = purchaseService } = {}
) {
  try {
    if (!providerName) throw new Error("providerName es requerido.");
    if (!paymentId) throw new Error("paymentId es requerido.");

    const provider = factory(providerName);
    if (!provider) throw new Error(`Provider no encontrado: ${providerName}`);

    const resp = await provider.refundPayment(paymentId, refundOpts);

    if (resp && resp.refunded) {
      await purchaseSvc.markPurchaseRefunded(paymentId, { refundInfo: resp });
    }

    return resp;
  } catch (error) {
    throw new Error(`Error en refundPayment: ${error.message}`);
  }
}

/**
 * mapProviderStatusToLocal
 * - Normaliza estados del provider a los tuyos.
 */
export function mapProviderStatusToLocal(providerStatus) {
  if (!providerStatus) return "pending";
  const s = String(providerStatus).toLowerCase();
  if (["approved", "paid", "completed", "success"].includes(s))
    return "approved";
  if (["pending", "in_process", "pending_payment"].includes(s))
    return "pending";
  if (["rejected", "cancelled", "failed"].includes(s)) return "rejected";
  if (["refunded", "returned"].includes(s)) return "refunded";
  return "pending";
}
