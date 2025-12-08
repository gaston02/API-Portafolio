import { Router } from "express";
import {
  createTemplateController,
  updateTemplateController,
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

router.put(
  "/template/:id",
  authMiddleware,
  validateSchemaParams(idSchema),
  validateSchema(updateTemplateSchema),
  updateTemplateController
);

export default router;
