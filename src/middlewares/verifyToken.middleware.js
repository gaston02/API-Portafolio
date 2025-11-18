import jwt from "jsonwebtoken";
import { handleGenericError } from "../utils/error.util.js";
import Admin from "../models/admin.model.js";
import { TOKEN_SECRET } from "../config.js";

export async function authMiddleware(req, res, next) {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.clearCookie("token");
      return handleGenericError(res, 401, "Acceso no autorizado");
    }

    // Crear una promesa manualmente
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });

    const admin = await Admin.findOne({ _id: decoded.id, status: true });

    if (!admin) {
      res.clearCookie("token");
      return handleGenericError(res, 401, "Administrador no encontrado");
    }

    req.admin = {
      id: admin._id,
      userName: admin.userName,
      email: admin.email,
      role: admin.role,
      profileImage: admin.profileImage,
    };

    next();
  } catch (error) {
    const message =
      error instanceof jwt.TokenExpiredError
        ? "Token expirado"
        : error instanceof jwt.JsonWebTokenError
        ? "Token inválido"
        : "Error de autenticación";

    res.clearCookie("token");

    handleGenericError(res, 401, message);
  }
}
