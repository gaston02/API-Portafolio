import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Obtener ruta absoluta del directorio actual (src/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración de multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname); // Obtener extensión del archivo
    cb(null, file.fieldname + "-" + uniqueSuffix + extension); // Definir el nombre del archivo
  },
});

// Filtro para permitir solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Aceptar el archivo si es una imagen
  } else {
    cb(new Error("El archivo subido no es una imagen"), false); // Rechazar si no es una imagen
  }
};

export const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Tamaño máximo del archivo: 50MB
}).single("image"); // 'image' es el nombre del campo del formulario donde se sube la imagen

export const profileImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Tamaño máximo del archivo: 50MB
}).single("profileImage"); // 'profileImage' es el nombre del campo del formulario donde se sube la imagen