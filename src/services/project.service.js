import Project from "../models/project.model.js";
import { normalizeText } from "../utils/normalizeText.util.js";
import { translateText } from "../libs/translate.js";
import { IMAGES_DIR } from "../config.js";

const imagesDir = IMAGES_DIR;

export async function createProject(projectData) {
  try {
    const { path, link, linkHub, title, description, highlights, status } =
      projectData;

    if (typeof link === "string" && link.trim() !== "") {
      const existingByLink = await Project.findOne({ link: link.trim() });
      if (existingByLink) {
        throw new Error("El link de demo ya está registrado.");
      }
    }

    if (typeof linkHub === "string" && linkHub.trim() !== "") {
      const existingByLinkHub = await Project.findOne({
        linkHub: linkHub.trim(),
      });
      if (existingByLinkHub) {
        throw new Error("El link de repositorio ya está registrado.");
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

export async function updateProject(projectId, projectData, imagesDir) {
  // 1) Armar solo lo que se actualizará
  const updatedData = {};

  // Guardamos newPath si viene, para decidir cleanup después
  const newPath =
    typeof projectData.path === "string" ? projectData.path.trim() : null;

  // --- TITLE (string ES -> {es,en}) ---
  if (typeof projectData.title === "string") {
    const normalizedTitleEs = normalizeText(projectData.title);
    const translatedTitleEn = await translateText(normalizedTitleEs, "EN-GB");
    updatedData.title = { es: normalizedTitleEs, en: translatedTitleEn };
  }

  // --- DESCRIPTION (string ES -> {es,en}) ---
  if (typeof projectData.description === "string") {
    const normalizedDescriptionEs = normalizeText(projectData.description);
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
  if (Array.isArray(projectData.highlights)) {
    const normalizedEsList = projectData.highlights
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

  if (typeof projectData.link === "string") {
    updatedData.link = projectData.link.trim();
  }

  if (typeof projectData.linkHub === "string") {
    updatedData.linkHub = projectData.linkHub.trim();
  }

  if (typeof projectData.status === "boolean") {
    updatedData.status = projectData.status;
  }

  // 2) Si no hay nada que actualizar
  if (Object.keys(updatedData).length === 0) {
    throw new Error("No se proporcionaron campos para actualizar.");
  }

  // 3) Actualizar en BD
  const updatedProject = await Project.findOneAndUpdate(
    { _id: projectId, status: true },
    { $set: updatedData },
    { new: true }
  );

  if (!updatedProject) {
    throw new Error("El proyecto no existe.");
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
      await deleteOldProjectImageIfChanged({
        projectId,
        newPath,
        imagesDir,
        onlyIfStatusTrue: true,
      });
    }
  }

  return updatedProject;
}

/**
 * Borra la imagen anterior de un proyecto si:
 * - existe un oldPath
 * - oldPath !== newPath
 * - el archivo está en uploadsDir
 *
 * Si el archivo no existe (ENOENT), no hace nada.
 */
export async function deleteOldProjectImageIfChanged({
  projectId,
  newPath,
  uploadsDir,
  onlyIfStatusTrue = true, // opcional por si quieres respetar tu regla
}) {
  // 1) Traer el project actual (solo necesitamos path)
  const query = onlyIfStatusTrue
    ? { _id: projectId, status: true }
    : { _id: projectId };

  const project = await Project.findOne(query).select("path");
  if (!project) {
    throw new Error("El proyecto no existe.");
  }

  const oldPath = project.path;

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

export async function updateProjectEn(projectId, projectData) {
  try {
    const existingProject = await Project.findOne({
      _id: projectId,
      status: true,
    });

    if (!existingProject) {
      throw new Error("El proyecto no existe.");
    }

    const updatedData = {};

    // --- TITLE EN ---
    if (typeof projectData.titleEn === "string") {
      const value = projectData.titleEn.trim();
      if (!value) {
        throw new Error("El título en inglés no puede estar vacío.");
      }
      updatedData["title.en"] = value;
    }

    // --- DESCRIPTION EN ---
    if (typeof projectData.descriptionEn === "string") {
      const value = projectData.descriptionEn.trim();
      if (!value) {
        throw new Error("La descripción en inglés no puede estar vacía.");
      }
      updatedData["description.en"] = value;
    }

    // --- HIGHLIGHTS.EN ---
    if (Array.isArray(projectData.highlightsEn)) {
      if (projectData.highlightsEn.length === 0) {
        throw new Error("Los highlights en inglés no pueden estar vacíos.");
      }

      // Mantenemos los 'es' existentes y reemplazamos solo 'en'
      const updatedHighlights = existingProject.highlights.map(
        (highlight, index) => ({
          es: highlight.es,
          en: projectData.highlightsEn[index]?.trim() || highlight.en,
        })
      );

      updatedData.highlights = updatedHighlights;
    }

    if (Object.keys(updatedData).length === 0) {
      throw new Error("No se proporcionaron campos en inglés para actualizar.");
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $set: updatedData },
      { new: true }
    );

    return updatedProject;
  } catch (error) {
    throw new Error(
      `Error al actualizar campos en ingles del proyecto: ${error.message}`
    );
  }
}

export async function getProjects() {
  try {
    const projects = await Project.find({ status: true });
    return projects;
  } catch (error) {
    throw new Error(`Error al obtener los proyectos: ${error.message}`);
  }
}

export async function deleteProject(projectId) {
  try {
    const existingproject = await Project.findOne({
      _id: projectId,
      status: true,
    });
    if (!existingproject) {
      throw new Error("El proyecto no existe.");
    }

    const deleteProyect = await Project.findOneAndUpdate(
      { _id: projectId, status: true },
      { $set: { status: false } },
      { new: true }
    );

    return deleteProyect;
  } catch (error) {
    throw new Error(`Error al eliminar el proyecto: ${error.message}`);
  }
}
