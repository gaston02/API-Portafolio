import dotenv from "dotenv";

dotenv.config();

export const DB_URI = process.env.MONGODB_URI;
export const ROOT_ADMIN_USERNAME = process.env.ROOT_ADMIN_USERNAME;
export const ROOT_ADMIN_EMAIL = process.env.ROOT_ADMIN_EMAIL;
export const ROOT_ADMIN_PASSWORD = process.env.ROOT_ADMIN_PASSWORD;