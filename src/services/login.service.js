import bcrypt from "bcryptjs";
import { findAdmin } from "./admin.service.js";

export async function login(email, password) {
  try {
    const admin = await findAdmin(email);
    if (!admin) {
      return false;
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return false;
    }
    return true;
  } catch (error) {
    throw new Error(`Error al realizar el login: ${error.message}`);
  }
}
