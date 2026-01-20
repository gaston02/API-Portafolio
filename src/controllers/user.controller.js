import { sendContactEmailToOwner } from "../services/user.service.js";
import { handleGenericError } from "../utils/error.util.js";
import { handleGenericSuccess } from "../utils/success.util.js";

export async function sendContactEmailToOwnerController(req, res, next) {
  const { name, email, message } = req.body;
  try {
    const response = await sendContactEmailToOwner({ name, email, message });
    return handleGenericSuccess(res, 200, response, "Email enviado con exito!");
  } catch (error) {
    return handleGenericError(
      res,
      500,
      `Error al enviar email: ${error.message}`
    );
  }
}
