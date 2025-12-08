import mongoose from "mongoose";

const { Schema, model } = mongoose;

const purchaseSchema = new Schema(
  {
    // Qué template se compró
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },

    // ID del pago en la pasarela (Mercado Pago, PayPal, Stripe, etc.)
    paymentId: {
      type: String,
      required: true,
      unique: true, // un pago = un registro
      trim: true,
    },

    // Qué pasarela usaste (por si mañana agregas más)
    provider: {
      type: String,
      enum: ["mercadopago", "paypal", "stripe", "other"],
      required: true,
    },

    // Monto cobrado (para referencia / auditoría)
    amount: {
      type: Number,
      required: true,
    },

    // Moneda usada (ej: CLP, USD)
    currency: {
      type: String,
      required: true,
      default: "CLP",
    },

    // Estado del pago según confirmación de la pasarela
    status: {
      type: String,
      enum: ["success", "failure", "pending", "refunded"],
      default: "pending",
    },

    // Opcional: datos mínimos del comprador (sin obligar a registrarse)
    buyerEmail: {
      type: String,
      required: false,
      trim: true,
    },
    buyerName: {
      required: false,
      type: String,
      trim: true,
    },
    buyerIp: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

export default model("Purchase", purchaseSchema);
