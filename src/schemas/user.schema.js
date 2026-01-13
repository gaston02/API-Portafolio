import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string({ required_error: "Nombre es requerido" })
    .min(3, {
      message: "El nombre debe tener al menos 3 caracteres",
    })
    .refine((data) => data.trim() !== "", {
      message: "El nombre no puede estar vacío",
    })
    .refine((data) => /^[^. ]+(\.[^. ]+)?$/.test(data), {
      message: "El nombre no puede tener espacios, ni caracteres especiales",
    }),
  email: z
    .string({ required_error: "Email es requerido" })
    .refine((data) => data.trim() !== "", {
      message: "El email no puede estar vacío",
    })
    .refine((data) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data), {
      message: "El email no es válido",
    }),
  message: z
    .string({ required_error: "Mensaje es requerido" })
    .refine((data) => data.trim() !== "", {
      message: "El mensaje no puede estar vacío",
    }),
});
