import Project from "../models/project.model.js";
import { normalizeText } from "../utils/normalizeText.util.js";
import { translateText } from "../libs/translate.js";
import { IMAGES_DIR } from "../config.js";

const imagesDir = IMAGES_DIR;

export async function createProject(projectData) {
  try {
    const { path, link, linkHub, title, description, highlights, status } =
      projectData;

    // Verificar que no exista otro project con el mismo link de demo
    const existingByLink = await Project.findOne({ link });
    if (existingByLink) {
      throw new Error("El link de demo ya está registrado.");
    }

    // Verificar que no exista otro projecto con el mismo link de repositorio
    const existingByLinkHub = await Project.findOne({ linkHub });
    if (existingByLink) {
      throw new Error("El link de repositorio ya está registrado.");
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

    const newProject = new Project({
      path: path || undefined,
      link,
      linkHub,
      title: {
        es: normalizedTitleEs,
        en: translatedTitle,
      },
      description: {
        es: normalizedDescriptionEs,
        en: translatedDescription,
      },
      highlights: processedHighlights,
      status,
    });

    return await newProject.save();
  } catch (error) {
    throw new Error(`Error al crear el proyecto: ${error.message}`);
  }
}
