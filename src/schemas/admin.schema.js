import { z } from "zod";

export const createAdminSchema = z.object({
  userName: z
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
    .refine(
    (data) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data),
    { message: "El email no es válido" }),
  password: z
    .string({
      required_error: "Password es requerida",
    })
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    })
    .refine((data) => data.trim() !== "", {
      message: "La contraseña no puede estar vacía",
    })
    .refine((data) => /[A-Z]/.test(data), {
      message: "La contraseña debe contener al menos una letra mayúscula",
    })
    .refine((data) => (data.match(/\d/g) || []).length >= 4, {
      message: "La contraseña debe contener al menos cuatro números",
    })
    .refine((data) => /[!@#$%^&*(),.?":{}|<>]/.test(data), {
      message: "La contraseña debe contener al menos un caracter especial",
    }),
  profileImage: z
    .string()
    .optional()
    .refine(
      (data) => {
        if (data !== undefined && data.trim() === "") {
          return false;
        }
        return true;
      },
      {
        message: "La imagen no puede estar vacía",
      }
    ),
});
