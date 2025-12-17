import { Router } from "express";
import { loginController, logout } from "../controllers/login.controller.js";
import { loginSchema } from "../schemas/login.schema.js";
import { validateSchema } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/login", validateSchema(loginSchema), loginController);
router.post("/logout", logout);

export default router;
