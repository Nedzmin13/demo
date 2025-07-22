// server/src/middleware/uploadMiddleware.js
import multer from 'multer';

// Configura multer per salvare i file temporaneamente in memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;