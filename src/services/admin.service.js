import bcrypt from "bcryptjs";
import Admin from "../models/admin.model.js";
import {
  ROOT_ADMIN_USERNAME,
  ROOT_ADMIN_EMAIL,
  ROOT_ADMIN_PASSWORD,
} from "../config.js";

export async function createRootAdminIfNotExists() {
  let admin = await Admin.findOne({ email: ROOT_ADMIN_EMAIL });

  if (admin) {
    // Si ya existe, asegurar que tenga rol root y esté activo
    let updated = false;

    if (admin.role !== "root") {
      admin.role = "root";
      updated = true;
    }

    if (admin.status === false) {
      admin.status = true;
      updated = true;
    }

    if (updated) {
      await admin.save();
      console.log(
        "[createRootAdminIfNotExists] Admin existente actualizado como root."
      );
    } else {
      console.log(
        "[createRootAdminIfNotExists] Admin root ya existe. No se hace nada."
      );
    }

    return admin;
  }

  const hashedPassword = await bcrypt.hash(ROOT_ADMIN_PASSWORD, 10);

  const newAdmin = new Admin({
    userName: ROOT_ADMIN_USERNAME,
    email: ROOT_ADMIN_EMAIL,
    password: hashedPassword,
    profileImage: "default",
    role: "root",
    status: true,
  });

  const savedAdmin = await newAdmin.save();
  console.log("[createRootAdminIfNotExists] Admin root creado.");

  return savedAdmin;
}

export async function findAdmin(emailAdmin) {
  try {
    const admin = await Admin.findOne({ email: emailAdmin, status: true });
    return admin;
  } catch (error) {
    throw new Error(`Error al obtener el Admin: ${error.message}`);
  }
}
