import Purchase from "../models/purchase.model.js";
import Template from "../models/template.model.js";

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
      status,
    } = purchaseData;

    // --- idempotencia primaria: si ya existe paymentId devolvemos el registro existente ---
    const existingByPayment = await purchaseModel.findOne({ paymentId }).exec();
    if (existingByPayment) {
      return existingByPayment;
    }

    // --- obtener template para validar existencia y precio ---
    const template = await templateModel
      .findById(templateId)
      .select("basePriceCLP")
      .exec();
    if (!template) {
      throw new Error("Template no encontrado.");
    }

    // --- determinar monto final ---
    let finalAmount =
      typeof incomingAmount === "number"
        ? incomingAmount
        : template.basePriceCLP || 0;

    if (
      typeof incomingAmount === "number" &&
      incomingAmount !== template.basePriceCLP
    ) {
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
      status: status ?? "pending",
      buyerEmail,
      buyerName,
      buyerIp,
      downloadCount: 1,
    };

    try {
      const [created] = await purchaseModel.create([toCreate], { session });

      // ✅ aquí sí: incrementamos el contador GLOBAL del template
      await templateModel.updateOne(
        { _id: templateId },
        { $inc: { downloadCount: 1 } },
        { session }
      );

      return created;
    } catch (err) {
      if (err && err.code === 11000) {
        const found = await purchaseModel.findOne({ paymentId }).exec();
        if (found) return found;
      }
      throw err;
    }
  } catch (error) {
    throw new Error(`Error al crear purchase: ${error.message}`);
  }
}

export async function updatePurchaseByPaymentId(
  paymentId,
  updateData,
  { purchaseModel = Purchase, session = null } = {}
) {
  try {
    const updated = await purchaseModel
      .findOneAndUpdate({ paymentId }, updateData, {
        new: true,
        session,
      })
      .exec();

    if (!updated) {
      throw new Error("Purchase no encontrada para actualizar.");
    }

    return updated;
  } catch (err) {
    throw new Error(`Error al actualizar purchase: ${err.message}`);
  }
}

export async function markPurchaseRefunded(
  paymentId,
  { refundInfo } = {},
  { purchaseModel = Purchase, session = null } = {}
) {
  try {
    const updated = await purchaseModel
      .findOneAndUpdate(
        { paymentId },
        {
          status: "refunded",
          $set: {
            refundInfo: refundInfo || null,
            refundAt: new Date(),
          },
        },
        {
          new: true,
          session,
        }
      )
      .exec();

    if (!updated) {
      throw new Error("Purchase no encontrada para marcar como refund.");
    }

    return updated;
  } catch (err) {
    throw new Error(`Error al marcar refund: ${err.message}`);
  }
}
