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
    const existingTemplate = await Template.findOne({
      _id: templateId,
      status: true,
    });
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
