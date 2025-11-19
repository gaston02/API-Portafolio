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
