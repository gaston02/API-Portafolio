import User from "../models/user.model.js";
import nodemailer from "nodemailer";
import {
  SMPT_HOST,
  SMPT_PORT,
  SMPT_USER,
  SMPT_PASS,
  EMAIL_FROM,
  EMAIL_TO,
} from "../config.js";
import { generateContactEmailTemplate } from "../utils/templateEmail.util.js";

// Cliente SMTP (se crea 1 vez y se reutiliza)
const transporter = nodemailer.createTransport({
  host: SMPT_HOST,
  port: Number(SMPT_PORT),
  secure: Number(SMPT_PORT) === 465, // 465 = SSL directo, 587 = STARTTLS
  auth: {
    user: SMPT_USER,
    pass: SMPT_PASS, // App Password (sin espacios)
  },
});

// Servicio: envía a TU correo el mensaje del formulario
export async function sendContactEmailToOwner({ name, email, message }) {
  const subject = `Nuevo mensaje de contacto (${name})`;

  const html = generateContactEmailTemplate({ name, email, message });
  await transporter.sendMail({
    from: EMAIL_FROM, // cómo aparece el remitente
    to: EMAIL_TO, // tu correo (destinatario)
    replyTo: email, // al responder, le respondes al usuario
    subject,
    html,
  });

  // opcional: puedes retornar algo útil
  return { ok: true };
}
