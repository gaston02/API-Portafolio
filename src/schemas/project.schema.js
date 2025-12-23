import { z } from "zod";

export const createProjectSchema = z.object({
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
        message: "El link del demo no puede estar vacío",
      }
    ),

  linkHub: z
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
        message: "El link del repositorio no puede estar vacío",
      }
    ),

  title: z
    .string({ required_error: "El título es obligatorio" })
    .min(10, "El título debe tener al menos 10 caracteres")
    .refine((data) => data.trim() !== "", {
      message: "El título no puede estar vacío",
    }),
  description: z
    .string({ required_error: "La descripción es obligatoria" })
    .refine((data) => data.trim() !== "", {
      message: "La descripción no puede estar vacía",
    }),
  highlights: z.array(
    z.string().refine((data) => data.trim() !== "", {
      message: "El highlight no puede estar vacío",
    })
  ),
  status: z.boolean().default(true),
});

export const updateProjectSchema = z.object({
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
        message: "El link del demo no puede estar vacío",
      }
    ),

  linkHub: z
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
        message: "El link del repositorio no puede estar vacío",
      }
    ),

  title: z
    .string()
    .optional()
    .refine(
      (data) => data === undefined || (data.trim() !== "" && data.length >= 10),
      {
        message:
          "El título no puede estar vacío y debe tener al menos 10 caracteres",
      }
    ),
  description: z
    .string()
    .optional()
    .refine((data) => data === undefined || data.trim() !== "", {
      message: "La descripción no puede estar vacía",
    }),
  highlights: z.array(
    z.string().refine((data) => data.trim() !== "", {
      message: "El highlight no puede estar vacío",
    })
  ),
  status: z.boolean().default(true),
});
