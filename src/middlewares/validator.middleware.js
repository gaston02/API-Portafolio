import { ZodError } from "zod";
import fs from "fs/promises";
import path from "path";

export const validateSchema = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);

    req.body = parsed;

    next();
  } catch (error) {
    let errorMessage;

    if (error instanceof ZodError && error.errors && error.errors.length > 0) {
      errorMessage = error.errors[0].message;
    } else {
      errorMessage = error.message;
    }

    return res.status(400).json({ error: errorMessage });
  }
};

export const validateSchemaParams = (schema) => (req, res, next) => {
  try {
    schema.parse(req.params);
    next();
  } catch (error) {
    let errorMessage;

    if (error instanceof ZodError && error.errors && error.errors.length > 0) {
      errorMessage = error.errors[0].message;
    } else {
      errorMessage = error.message;
    }

    return res.status(400).json({ error: errorMessage });
  }
};

// Si highlights viene como JSON string, lo convertimos a array
const parseHighlights = (value) => {
  if (!value) return value; // deja undefined/null para que el schema decida
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value; // deja que el schema falle con buen mensaje
    }
  }

  return value;
};

export const validateTemplateSchemaWithFileAndCleanup =
  (schema, fileKey, uploadDir) => async (req, res, next) => {
    try {
      const data = {
        path: req[fileKey],
        link: req.body.link,
        title: req.body.title,
        description: req.body.description,
        highlights: parseHighlights(req.body.highlights),
        basePriceCLP:
          req.body.basePriceCLP === undefined || req.body.basePriceCLP === ""
            ? 0
            : Number(req.body.basePriceCLP),
      };

      schema.parse(data);

      req.body.highlights = data.highlights;
      req.body.basePriceCLP = data.basePriceCLP;
      req.body.path = data.path;

      next();
    } catch (error) {
      // ✅ Cleanup del archivo si ya se subió (da lo mismo si fue Zod o no)
      try {
        const filenameOrRelPath = req[fileKey];
        if (filenameOrRelPath) {
          const filePath = path.join(uploadDir, filenameOrRelPath);
          await fs.unlink(filePath); // access no es necesario; unlink ya lanza ENOENT
          console.log("Imagen inválida eliminada correctamente.");
        }
      } catch (unlinkError) {
        if (unlinkError?.code === "ENOENT") {
          console.log("El archivo ya no existe, nada que eliminar.");
        } else {
          console.error(`Error al eliminar la imagen: ${unlinkError?.message}`);
        }
      }

      // ✅ Manejo de error Zod vs otros
      if (error instanceof ZodError) {
        const errorMessage =
          error.errors?.[0]?.message || "Error de validación";
        return res.status(400).json({ error: errorMessage });
      }

      // Otros errores (bug, null access, etc.)
      console.error("Error no-Zod en validateTemplate:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };
