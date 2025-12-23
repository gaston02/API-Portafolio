import { createProject } from "../services/project.service.js";
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
