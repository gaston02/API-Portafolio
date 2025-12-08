import Template from "../models/template.model.js";
import { normalizeText } from "../utils/normalizeText.util.js";
import { translateText } from "../libs/translate.js";

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

export async function updateTemplate(templateId, templateData) {
  try {
    // 1) Verificar que el template exista
    const existingTemplate = await Template.findById(templateId);
    if (!existingTemplate) {
      throw new Error("El template no existe.");
    }

    // 2) Objeto donde juntamos solo lo que queremos actualizar
    const updatedData = {};

    // --- TITLE (string en español → { es, en }) ---
    if (typeof templateData.title === "string") {
      const normalizedTitleEs = normalizeText(templateData.title);
      const translatedTitleEn = await translateText(normalizedTitleEs, "EN-GB");

      updatedData.title = {
        es: normalizedTitleEs,
        en: translatedTitleEn,
      };
    }

    // --- DESCRIPTION (string en español → { es, en }) ---
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

    // --- HIGHLIGHTS (array de strings en español → array de { es, en }) ---
    if (Array.isArray(templateData.highlights)) {
      const translatedHighlights = [];
      for (const h of templateData.highlights) {
        const normalizedEs = normalizeText(h);
        const translatedEn = await translateText(normalizedEs, "EN-GB");
        translatedHighlights.push({
          es: normalizedEs,
          en: translatedEn,
        });
      }
      updatedData.highlights = translatedHighlights;
    }

    // --- CAMPOS SIMPLES QUE NO REQUIEREN TRADUCCIÓN ---
    if (typeof templateData.path === "string") {
      updatedData.path = templateData.path.trim();
    }

    if (typeof templateData.link === "string") {
      updatedData.link = templateData.link.trim();
    }

    if (typeof templateData.downloadPath === "string") {
      updatedData.downloadPath = templateData.downloadPath.trim();
    }

    if (typeof templateData.basePriceCLP === "number") {
      updatedData.basePriceCLP = templateData.basePriceCLP;
    }

    if (typeof templateData.status === "boolean") {
      updatedData.status = templateData.status;
    }

    // 3) Si no hay nada que actualizar, lanzamos un error opcionalmente
    if (Object.keys(updatedData).length === 0) {
      throw new Error("No se proporcionaron campos para actualizar.");
    }

    // 4) Actualizar el documento en la BD
    const updatedTemplate = await Template.findByIdAndUpdate(
      templateId,
      { $set: updatedData },
      { new: true }
    );

    return updatedTemplate;
  } catch (error) {
    throw new Error(`Error al actualizar el template: ${error.message}`);
  }
}
