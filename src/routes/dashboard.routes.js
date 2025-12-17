import { Router } from "express";
import {
  createTemplateController,
  getTemplatesController,
  updateTemplateController,
  updateTemplateEnController,
  deleteTemplateController,
  getTemplatesDeletesController,
  avtiveTemplateDeleteController,
} from "../controllers/template.controller.js";
import {
  createTemplateSchema,
  updateTemplateSchema,
} from "../schemas/template.schema.js";
import { idSchema } from "../schemas/id.schema.js";
import {
  validateSchema,
  validateSchemaParams,
} from "../middlewares/validator.middleware.js";
import { authMiddleware } from "../middlewares/verifyToken.middleware.js";

const router = Router();

router.post(
  "/template",
  authMiddleware,
  validateSchema(createTemplateSchema),
  createTemplateController
);

router.get("/templates", authMiddleware, getTemplatesController);

router.put(
  "/template/:id",
  authMiddleware,
  validateSchemaParams(idSchema),
  validateSchema(updateTemplateSchema),
  updateTemplateController
);

router.put(
  "/template/:id/en",
  authMiddleware,
  validateSchemaParams(idSchema),
  updateTemplateEnController
);

router.delete(
  "/template/:id",
  authMiddleware,
  validateSchemaParams(idSchema),
  deleteTemplateController
);

router.get("/templates/deletes", authMiddleware, getTemplatesDeletesController);

router.put(
  "/template/:id/delete",
  authMiddleware,
  validateSchemaParams(idSchema),
  avtiveTemplateDeleteController
);

export default router;
