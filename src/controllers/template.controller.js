import {
  createTemplate,
  updateTemplate,
} from "../services/template.service.js";
import { handleGenericError } from "../utils/error.util.js";
import { handleGenericSuccess } from "../utils/success.util.js";

export async function createTemplateController(req, res, next) {
  try {
    const templateData = {
      path: req.file?.path,
      link: req.body.link,
      title: req.body.title,
      description: req.body.description,
      highlights: req.body.highlights,
      basePriceCLP:
        req.body.basePriceCLP !== undefined
          ? Number(req.body.basePriceCLP)
          : undefined,
      downloadPath: req.body.downloadPath,
    };
    const newTemplate = await createTemplate(templateData);
    return handleGenericSuccess(
      res,
      201,
      newTemplate,
      "Template creado con éxito!"
    );
  } catch (error) {
    return handleGenericError(
      res,
      400,
      `Error al crear template: ${error.message}`
    );
  }
}

export async function updateTemplateController(req, res, next) {
  const id = req.params.id;
  const templateData = req.body;

  try {
    const updatedTemplate = await updateTemplate(id, templateData);
    return handleGenericSuccess(
      res,
      200,
      updatedTemplate,
      "Template actualizado con éxito!"
    );
  } catch (error) {
    if (error.message.includes("template no existe")) {
      handleGenericError(res, 404, `template no encontrado`);
    } else {
      handleGenericError(
        res,
        400,
        `Error al actualizar el template: ${error.message}`
      );
    }
    next(error);
  }
}
