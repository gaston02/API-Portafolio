import { createTemplate } from "../services/template.service.js";
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
