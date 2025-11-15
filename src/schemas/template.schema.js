import { z } from "zod";

export const createTemplateSchema = z.object({
  path: z
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
  link: z
    .string({ required_error: "El link es obligatorio" })
    .refine((data) => data.trim() !== "", {
      message: "El link del demo no puede estar vacío",
    }),
  title: z.object({
    es: z
      .string({ required_error: "El título es obligatorio" })
      .min(10, "El título debe tener al menos 10 caracteres")
      .refine((data) => data.trim() !== "", {
        message: "El título no puede estar vacío",
      }),
    en: z
      .string({ required_error: "The title is required" })
      .min(10, "The title must be at least 10 characters long")
      .refine((data) => data.trim() !== "", {
        message: "The title cannot be empty",
      }),
  }),
  description: z.object({
    es: z
      .string({ required_error: "La descripción es obligatoria" })
      .refine((data) => data.trim() !== "", {
        message: "La descripción no puede estar vacía",
      }),
    en: z
      .string({ required_error: "The description is required" })
      .refine((data) => data.trim() !== "", {
        message: "The description cannot be empty",
      }),
  }),
  basePriceCLP: z
    .number()
    .nonnegative("El precio no puede ser negativo")
    .optional(),
  downloadPath: z
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
        message: "La ruta de descarga no puede estar vacía",
      }
    ),
  status: z.boolean().default(true),
});
