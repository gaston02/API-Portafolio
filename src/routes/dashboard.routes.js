import { Router } from "express";
import { createTemplateController } from "../controllers/template.controller.js";
import { createTemplateSchema } from "../schemas/template.schema.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { authMiddleware } from "../middlewares/verifyToken.middleware.js";

const router = Router();

router.post(
  "/template",
  validateSchema(createTemplateSchema),
  authMiddleware,
  createTemplateController
);

export default router;
