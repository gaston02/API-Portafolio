import { Router } from "express";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { createPurchaseSchema } from "../schemas/purchase.schema.js";
import {
  createPaymentController,
  genericWebhookController,
} from "../controllers/payment.controller.js";

const router = Router();

// Crear intento de compra
router.post("/", validateSchema(createPurchaseSchema), createPaymentController);

// Webhooks generico de servicio de pasarela de pago
router.post("/webhooks/:provider", genericWebhookController);
