import { z } from "zod";

export const idSchema = z.object({
  id: z
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
});