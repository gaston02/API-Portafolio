import { login } from "../services/login.service.js";
import { findAdmin } from "../services/admin.service.js";
import { handleGenericError } from "../utils/error.util.js";
import { handleGenericSuccess } from "../utils/success.util.js";
import { createToken } from "../libs/jwt.js";

export async function loginController(req, res, next) {
  const { email, password } = req.body;

  try {
    const success = await login(email, password);
    if (!success) {
      return handleGenericError(res, 401, "Credenciales incorrectas");
    }
    const admin = await findAdmin(email);
    if (!admin) {
      return handleGenericError(res, 404, "Usuario no encontrado");
    }

    // Genera el token
    const token = await createToken({ id: admin._id });

    // Configuración de la cookie (1 semana de duración)
    res.cookie("token", token, {
      httpOnly: true, // Bloquea acceso desde JS
      secure: true, // Solo HTTPS
      sameSite: "None", // Cross-origin
      path: "/", // Válida en todas las rutas
      maxAge: 7 * 24 * 60 * 60 * 1000, // 604,800,000 ms = 1 semana
    });

    const adminData = {
      _id: admin._id,
      userName: admin.userName,
      email: admin.email,
      role: admin.role,
      profileImage: admin.profileImage,
      status: admin.status,
    };

    return handleGenericSuccess(res, 200, "Login exitoso", adminData);
  } catch (error) {
    handleGenericError(res, 500, `Error al hacer el login: ${error.message}`);
    next(error);
  }
}

export async function logout(req, res) {
  try {
    res.cookie("token", "", {
      expires: new Date(0),
    });
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return res.status(500).send("Error al cerrar sesión");
  }
}
