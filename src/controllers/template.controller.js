import {
  createTemplate,
  getTemplates,
  updateTemplate,
  updateTemplateEn,
  deleteTemplate,
  getTemplatesDeletes,
  avtiveTemplateDelete,
} from "../services/template.service.js";
import { handleGenericError } from "../utils/error.util.js";
import { handleGenericSuccess } from "../utils/success.util.js";

export async function createTemplateController(req, res, next) {
  try {
    const templateData = {
      path: req.templateImagePath,
      link: req.body.link,
      title: req.body.title,
      description: req.body.description,
      highlights: req.body.highlights,
      basePriceCLP: req.body.basePriceCLP,
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
      500,
      `Error al crear template: ${error.message}`
    );
  }
}

export async function getTemplatesController(req, res, next) {
  try {
    const templates = await getTemplates();
    return handleGenericSuccess(res, 200, templates, "Templates obtenidos!");
  } catch (error) {
    return handleGenericError(res, 400, `Error al obtener templates: ${error}`);
  }
}

export async function updateTemplateController(req, res, next) {
  const id = req.params.id;

  // Partimos con lo que venga en body
  const templateData = { ...req.body };

  // ✅ Si se subió una imagen, usarla como path
  if (req.templateImagePath) {
    templateData.path = req.templateImagePath;
  }

  // (Opcional pero recomendado) Normalizar basePriceCLP si viene por form-data
  // porque suele llegar como string
  if (
    templateData.basePriceCLP !== undefined &&
    templateData.basePriceCLP !== ""
  ) {
    const n = Number(templateData.basePriceCLP);
    if (!Number.isNaN(n)) templateData.basePriceCLP = n;
  }

  try {
    const updatedTemplate = await updateTemplate(id, templateData);
    return handleGenericSuccess(
      res,
      200,
      updatedTemplate,
      "Template actualizado con éxito!"
    );
  } catch (error) {
    if (error.message.toLowerCase().includes("template no existe")) {
      handleGenericError(res, 404, "template no encontrado");
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

export async function updateTemplateEnController(req, res, next) {
  const id = req.params.id;
  const templateData = req.body;

  try {
    const updatedTemplate = await updateTemplateEn(id, templateData);
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

export async function deleteTemplateController(req, res, next) {
  const id = req.params.id;
  try {
    const deletedTemplate = await deleteTemplate(id);
    return handleGenericSuccess(
      res,
      204,
      deletedTemplate,
      "Template eliminado con éxito!"
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

export async function getTemplatesDeletesController(req, res, next) {
  try {
    const templates = await getTemplatesDeletes();
    return handleGenericSuccess(res, 200, templates, "Templates obtenidos!");
  } catch (error) {
    return handleGenericError(res, 400, `Error al obtener templates: ${error}`);
  }
}

export async function avtiveTemplateDeleteController(req, res, next) {
  const id = req.params.id;
  try {
    const activatedTemplate = await avtiveTemplateDelete(id);
    return handleGenericSuccess(
      res,
      200,
      activatedTemplate,
      "Template activado con éxito!"
    );
  } catch (error) {
    if (error.message.includes("template no existe")) {
      handleGenericError(res, 404, `template no encontrado`);
    } else {
      handleGenericError(
        res,
        400,
        `Error al activar el template: ${error.message}`
      );
    }
    next(error);
  }
}
