import { z } from "zod";

export const createPurchaseSchema = z.object({
  templateId: z
    .string({
      required_error: "ID es requerido",
    })
    .length(24, {
      message: "El ID debe tener 24 caracteres",
    })
    .refine(
      (id) => {
        return /^[0-9a-fA-F]{24}$/.test(id);
      },
      {
        message: "El ID debe ser una cadena hexadecimal de 24 caracteres",
      }
    ),
  provider: z.enum(["mercadopago", "stripe", "paypal"]),
  buyerEmail: z
    .string()
    .optional()
    .refine(
      (data) =>
        data === undefined ||
        (data.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)),
      {
        message: "El email no puede estar vacío y debe ser válido",
      }
    ),
  buyerName: z
    .string()
    .optional()
    .refine(
      (data) =>
        data === undefined || (data.trim() !== "" && data.trim().length >= 3),
      {
        message:
          "El nombre no puede estar vacío, ni puede tener menos de 3 caracteres",
      }
    ),
  amount: z.number().positive().optional(),
  currency: z.string().default("CLP"),
});
