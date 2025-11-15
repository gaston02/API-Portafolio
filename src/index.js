import app from "./app.js";
import { connectDB } from "./db.js";
import { createRootAdminIfNotExists } from "./services/admin.service.js";

async function start() {
  await connectDB();

  // Crear root admin automáticamente si no existe
  await createRootAdminIfNotExists();

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}

start();
