import { createProject, updateProject } from "../services/project.service.js";
import { handleGenericError } from "../utils/error.util.js";
import { handleGenericSuccess } from "../utils/success.util.js";

export async function createProjectController(req, res, next) {
  try {
    const projectData = {
      path: req.templateImagePath,
      link: req.body.link,
      linkHub: req.body.linkHub,
      title: req.body.title,
      description: req.body.description,
      highlights: req.body.highlights,
      status: req.body.status,
    };
    const createdProject = await createProject(projectData);
    return handleGenericSuccess(
      res,
      201,
      createdProject,
      "Proyecto creado con éxito!"
    );
  } catch (error) {
    return handleGenericError(res, 500, `Error al crear el proyecto: ${error}`);
  }
}

export async function updateProjectController(req, res, next) {
  const id = req.params.id;

  // Partimos con lo que venga en body
  const projectData = { ...req.body };

  // ✅ Si se subió una imagen, usarla como path
  if (req.templateImagePath) {
    projectData.path = req.templateImagePath;
  }

  try {
    const updatedProject = await updateProject(id, projectData);
    return handleGenericSuccess(
      res,
      200,
      updatedProject,
      "Proyecto actualizado con éxito!"
    );
  } catch (error) {
    if (error.message.toLowerCase().includes("proyecto no existe")) {
      handleGenericError(res, 404, "proyecto no encontrado");
    } else {
      handleGenericError(
        res,
        400,
        `Error al actualizar el proyecto: ${error.message}`
      );
    }
    next(error);
  }
}
