import Purchase from "../models/Purchase.js";
import Template from "../models/Template.js";

export async function createPurchase(
  purchaseData = {},
  { purchaseModel = Purchase, templateModel = Template, session = null } = {}
) {
  try {
    const {
      templateId,
      paymentId,
      provider,
      amount: incomingAmount,
      currency = "CLP",
      buyerEmail,
      buyerName,
      buyerIp,
      downloadLimit,
    } = purchaseData;

    // --- idempotencia primaria: si ya existe paymentId devolvemos el registro existente ---
    const existingByPayment = await purchaseModel.findOne({ paymentId }).exec();
    if (existingByPayment) {
      return existingByPayment;
    }

    // --- obtener template para obtener precio y validar existencia (estilo createTemplate) ---
    const template = await templateModel
      .findById(templateId)
      .select("basePriceCLP")
      .exec();
    if (!template) {
      throw new Error("Template no encontrado.");
    }

    // --- determinar monto final (política simple: si el cliente envía amount debe coincidir) ---
    // Nota: si quieres otra política (aceptar overrides con metadata), lo defines aquí.
    let finalAmount =
      typeof incomingAmount === "number"
        ? incomingAmount
        : template.basePriceCLP || 0;
    if (
      typeof incomingAmount === "number" &&
      incomingAmount !== template.basePriceCLP
    ) {
      // Decide tu política. Aquí decidimos rechazar para evitar manipulaciones.
      throw new Error(
        "El monto proporcionado no coincide con el precio del template."
      );
    }

    // --- construir documento según tu schema ---
    const toCreate = {
      templateId,
      paymentId,
      provider,
      amount: finalAmount,
      currency,
      status: "pending",
      buyerEmail,
      buyerName,
      buyerIp,
      downloadCount: 0,
    };

    // --- intento de creación con manejo de condición de carrera sobre unique index ---
    try {
      // Uso create con array para poder pasar session si hace falta
      const [created] = await purchaseModel.create([toCreate], { session });
      return created;
    } catch (err) {
      // Si otro proceso insertó el mismo paymentId entre el findOne y el create,
      // manejamos la duplicidad devolviendo el registro existente.
      if (err && err.code === 11000) {
        const found = await purchaseModel.findOne({ paymentId }).exec();
        if (found) return found;
      }
      // cualquier otro error lo propagamos con el formato que usas
      throw err;
    }
  } catch (error) {
    throw new Error(`Error al crear purchase: ${error.message}`);
  }
}
