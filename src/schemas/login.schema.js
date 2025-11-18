import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email es requerido" })
    .refine((data) => data.trim() !== "", {
      message: "El email no puede estar vacío",
    })
    .refine((data) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data), {
      message: "El email no es válido",
    }),
  password: z
    .string({ required_error: "Password es requerida" })
    .refine((data) => data.trim() !== "", {
      message: "La contraseña no puede estar vacía",
    }),
});
