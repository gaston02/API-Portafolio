import { Router } from "express";
import { sendContactEmailToOwnerController } from "../controllers/user.controller.js";
import { createUserSchema } from "../schemas/user.schema.js";
import { validateSchema } from "../middlewares/validator.middleware.js";

const router = Router();

router.post(
  "/contact",
  validateSchema(createUserSchema),
  sendContactEmailToOwnerController
);

export default router;