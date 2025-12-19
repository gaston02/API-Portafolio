import Template from "../models/template.model.js";
import { normalizeText } from "../utils/normalizeText.util.js";
import { translateText } from "../libs/translate.js";
import { IMAGES_DIR } from "../config.js";

const imagesDir = IMAGES_DIR;

export async function createTemplate(templateData) {
  try {
    const {
      path,
      link,
      title,
      description,
      highlights,
      basePriceCLP,
      downloadPath,
      status,
    } = templateData;

    // Verificar que no exista otro template con el mismo link de demo
    const existingByLink = await Template.findOne({ link });
    if (existingByLink) {
      throw new Error("El link de demo ya está registrado.");
    }

    // Si viene downloadPath, verificar que no esté siendo usado por otro template
    if (downloadPath) {
      const existingByDownload = await Template.findOne({ downloadPath });
      if (existingByDownload) {
        throw new Error(
          "La ruta de descarga ya está siendo usada por otro template."
        );
      }
    }

    // Si no vienen highlights, inicializar como array vacío
    const safeHighlights = Array.isArray(highlights) ? highlights : [];

    const normalizedTitleEs = normalizeText(title);
    const translatedTitle = await translateText(normalizedTitleEs, "EN-GB");
    const normalizedDescriptionEs = normalizeText(description);
    const translatedDescription = await translateText(
      normalizedDescriptionEs,
      "EN-GB"
    );

    const processedHighlights = await Promise.all(
      safeHighlights.map(async (item) => {
        const normalized = normalizeText(item); // item es string
        const translated = await translateText(normalized, "en"); // o "EN-GB" si quieres

        return {
          es: normalized,
          en: translated,
        };
      })
    );

    // Construir el nuevo template
    const newTemplate = new Template({
      path: path || undefined, // respeta optional + sparse
      link,
      title: {
        es: normalizedTitleEs,
        en: translatedTitle,
      },
      description: {
        es: normalizedDescriptionEs,
        en: translatedDescription,
      },
      highlights: processedHighlights,
      basePriceCLP: typeof basePriceCLP === "number" ? basePriceCLP : 0, // default lógico
      downloadPath: downloadPath || undefined,
      status,
    });

    const savedTemplate = await newTemplate.save();
    return savedTemplate;
  } catch (error) {
    throw new Error(`Error al crear el template: ${error.message}`);
  }
}

export async function updateTemplate(templateId, templateData, imagesDir) {
  // 1) Armar solo lo que se actualizará
  const updatedData = {};

  // Guardamos newPath si viene, para decidir cleanup después
  const newPath =
    typeof templateData.path === "string" ? templateData.path.trim() : null;

  // --- TITLE (string ES -> {es,en}) ---
  if (typeof templateData.title === "string") {
    const normalizedTitleEs = normalizeText(templateData.title);
    const translatedTitleEn = await translateText(normalizedTitleEs, "EN-GB");
    updatedData.title = { es: normalizedTitleEs, en: translatedTitleEn };
  }

  // --- DESCRIPTION (string ES -> {es,en}) ---
  if (typeof templateData.description === "string") {
    const normalizedDescriptionEs = normalizeText(templateData.description);
    const translatedDescriptionEn = await translateText(
      normalizedDescriptionEs,
      "EN-GB"
    );
    updatedData.description = {
      es: normalizedDescriptionEs,
      en: translatedDescriptionEn,
    };
  }

  // --- HIGHLIGHTS (array strings OR array {es} -> array {es,en}) ---
  if (Array.isArray(templateData.highlights)) {
    const normalizedEsList = templateData.highlights
      .map((item) => {
        const esText = typeof item === "string" ? item : item?.es;
        if (typeof esText !== "string") return null;
        return normalizeText(esText);
      })
      .filter(Boolean);

    const translatedEnList = await Promise.all(
      normalizedEsList.map((es) => translateText(es, "EN-GB"))
    );

    updatedData.highlights = normalizedEsList.map((es, i) => ({
      es,
      en: translatedEnList[i],
    }));
  }

  // --- CAMPOS SIMPLES (sin traducción) ---
  if (newPath) updatedData.path = newPath;

  if (typeof templateData.link === "string") {
    updatedData.link = templateData.link.trim();
  }

  if (typeof templateData.downloadPath === "string") {
    updatedData.downloadPath = templateData.downloadPath.trim();
  }

  // basePriceCLP: acepta number o string numérico
  if (typeof templateData.basePriceCLP === "number") {
    updatedData.basePriceCLP = templateData.basePriceCLP;
  } else if (
    typeof templateData.basePriceCLP === "string" &&
    templateData.basePriceCLP !== ""
  ) {
    const n = Number(templateData.basePriceCLP);
    if (Number.isFinite(n)) updatedData.basePriceCLP = n;
  }

  if (typeof templateData.status === "boolean") {
    updatedData.status = templateData.status;
  }

  // 2) Si no hay nada que actualizar
  if (Object.keys(updatedData).length === 0) {
    throw new Error("No se proporcionaron campos para actualizar.");
  }

  // 3) Actualizar en BD
  const updatedTemplate = await Template.findOneAndUpdate(
    { _id: templateId, status: true },
    { $set: updatedData },
    { new: true }
  );

  if (!updatedTemplate) {
    throw new Error("El template no existe.");
  }

  // 4) Cleanup: borrar imagen anterior si cambió el path
  // Solo tiene sentido si vino un newPath
  if (newPath) {
    // Si imagesDir no viene, mejor no intentar borrar (evitas borrar mal)
    if (!imagesDir) {
      console.warn(
        "imagesDir no provisto: se actualizó path pero no se eliminó imagen anterior."
      );
    } else {
      await deleteOldTemplateImageIfChanged({
        templateId,
        newPath,
        imagesDir,
        onlyIfStatusTrue: true,
      });
    }
  }

  return updatedTemplate;
}

/**
 * Borra la imagen anterior de un template si:
 * - existe un oldPath
 * - oldPath !== newPath
 * - el archivo está en uploadsDir
 *
 * Si el archivo no existe (ENOENT), no hace nada.
 */
export async function deleteOldTemplateImageIfChanged({
  templateId,
  newPath,
  uploadsDir,
  onlyIfStatusTrue = true, // opcional por si quieres respetar tu regla
}) {
  // 1) Traer el template actual (solo necesitamos path)
  const query = onlyIfStatusTrue
    ? { _id: templateId, status: true }
    : { _id: templateId };

  const template = await Template.findOne(query).select("path");
  if (!template) {
    throw new Error("El template no existe.");
  }

  const oldPath = template.path;

  // 2) Si no hay oldPath o no hay newPath, o son iguales => no hay nada que borrar
  if (!oldPath || !newPath || oldPath === newPath) return;

  // 3) Intentar borrar archivo viejo (sin romper si no existe)
  const oldFilePath = path.join(uploadsDir, oldPath);

  try {
    await fs.unlink(oldFilePath);
  } catch (err) {
    if (err?.code === "ENOENT") {
      // ya no existe => ok
      return;
    }
    // acá decide: o lanzas error, o solo logueas
    throw new Error(`No se pudo eliminar la imagen anterior: ${err.message}`);
  }
}

export async function updateTemplateEn(templateId, templateData) {
  try {
    const existingTemplate = await Template.findOne({
      _id: templateId,
      status: true,
    });
    if (!existingTemplate) {
      throw new Error("El template no existe.");
    }

    const updatedData = {};

    // --- TITLE.EN ---
    if (typeof templateData.titleEn === "string") {
      const value = templateData.titleEn.trim();
      if (!value) {
        throw new Error("El título en inglés no puede estar vacío.");
      }
      updatedData["title.en"] = value;
    }

    // --- DESCRIPTION.EN ---
    if (typeof templateData.descriptionEn === "string") {
      const value = templateData.descriptionEn.trim();
      if (!value) {
        throw new Error("La descripción en inglés no puede estar vacía.");
      }
      updatedData["description.en"] = value;
    }

    // --- HIGHLIGHTS.EN ---
    if (Array.isArray(templateData.highlightsEn)) {
      if (templateData.highlightsEn.length === 0) {
        throw new Error("Los highlights en inglés no pueden estar vacíos.");
      }

      // Mantenemos los 'es' existentes y reemplazamos solo 'en'
      const updatedHighlights = existingTemplate.highlights.map(
        (highlight, index) => ({
          es: highlight.es,
          en: templateData.highlightsEn[index]?.trim() || highlight.en,
        })
      );

      updatedData.highlights = updatedHighlights;
    }

    if (Object.keys(updatedData).length === 0) {
      throw new Error("No se proporcionaron campos en inglés para actualizar.");
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
      templateId,
      { $set: updatedData },
      { new: true }
    );

    return updatedTemplate;
  } catch (error) {
    throw new Error(
      `Error al actualizar campos en ingles del template: ${error.message}`
    );
  }
}

export async function deleteTemplate(templateId) {
  try {
    const existingTemplate = await Template.findOne({
      _id: templateId,
      status: true,
    });
    if (!existingTemplate) {
      throw new Error("El template no existe.");
    }

    const deleteProyect = await Template.findOneAndUpdate(
      { _id: templateId, status: true },
      { $set: { status: false } },
      { new: true }
    );

    return deleteProyect;
  } catch (error) {
    throw new Error(`Error al eliminar el template: ${error.message}`);
  }
}

export async function getTemplates() {
  try {
    const templates = await Template.find({ status: true });
    return templates;
  } catch (error) {
    throw new Error(`Error al obtener los templates: ${error.message}`);
  }
}

export async function getTemplatesDeletes() {
  try {
    const templates = await Template.find({ status: false });
    return templates;
  } catch (error) {
    throw new Error(
      `Error al obtener los templates eliminados: ${error.message}`
    );
  }
}

export async function avtiveTemplateDelete(templateId) {
  try {
    const existingTemplate = await Template.findOne({
      _id: templateId,
      status: false,
    });
    if (!existingTemplate) {
      throw new Error("El template no existe.");
    }

    const deleteProyect = await Template.findOneAndUpdate(
      { _id: templateId, status: false },
      { $set: { status: true } },
      { new: true }
    );

    return deleteProyect;
  } catch (error) {
    throw new Error(`Error al activar el template: ${error.message}`);
  }
}
