import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DB_URI = process.env.MONGODB_URI;
export const ROOT_ADMIN_USERNAME = process.env.ROOT_ADMIN_USERNAME;
export const ROOT_ADMIN_EMAIL = process.env.ROOT_ADMIN_EMAIL;
export const ROOT_ADMIN_PASSWORD = process.env.ROOT_ADMIN_PASSWORD;
export const IMAGES_DIR = path.join(__dirname, "uploads");
export const MYMEMORY_API = process.env.MYMEMORY;
export const TOKEN_SECRET = process.env.SECRET;
export const ACCESS_TOKEN = process.env.YOUR_ACCESS_TOKEN;
export const NGROK_AUTHTOKEN = process.env.YOUR_AUTHTOKEN;
export const SMPT_HOST = process.env.SMTP_HOST;
export const SMPT_PORT = process.env.SMTP_PORT;
export const SMPT_USER = process.env.SMTP_USER;
export const SMPT_PASS = process.env.SMTP_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const EMAIL_TO = process.env.EMAIL_TO;