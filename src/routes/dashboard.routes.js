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
  createProjectController,
  updateProjectController,
} from "../controllers/project.controller.js";
import {
  createTemplateSchema,
  updateTemplateSchema,
} from "../schemas/template.schema.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/project.schema.js";
import { idSchema } from "../schemas/id.schema.js";
import {
  validateSchema,
  validateSchemaParams,
  validateTemplateSchemaWithFileAndCleanup,
} from "../middlewares/validator.middleware.js";
import {
  setTemplateImagePath,
  uploadImage,
} from "../middlewares/uploadImage.middleware.js";
import { authMiddleware } from "../middlewares/verifyToken.middleware.js";
import { IMAGES_DIR } from "../config.js";

const imagesDir = IMAGES_DIR;

const router = Router();

router.post(
  "/template",
  authMiddleware,
  uploadImage,
  setTemplateImagePath,
  validateTemplateSchemaWithFileAndCleanup(
    createTemplateSchema,
    "templateImagePath",
    imagesDir
  ),
  createTemplateController
);

router.post(
  "/project",
  authMiddleware,
  uploadImage,
  setTemplateImagePath,
  validateTemplateSchemaWithFileAndCleanup(
    createProjectSchema,
    "templateImagePath",
    imagesDir
  ),
  createProjectController
);

router.get("/templates", authMiddleware, getTemplatesController);

router.put(
  "/template/:id",
  authMiddleware,
  validateSchemaParams(idSchema),
  uploadImage,
  setTemplateImagePath,
  validateTemplateSchemaWithFileAndCleanup(
    updateTemplateSchema,
    "templateImagePath",
    imagesDir
  ),
  updateTemplateController
);

router.put(
  "/project/:id",
  authMiddleware,
  validateSchemaParams(idSchema),
  uploadImage,
  setTemplateImagePath,
  validateTemplateSchemaWithFileAndCleanup(
    updateProjectSchema,
    "templateImagePath",
    imagesDir
  ),
  updateProjectController
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
