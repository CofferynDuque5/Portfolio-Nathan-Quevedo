import { createApiServer } from './app';
import { env } from './config/env';
import { notFound, errorHandler } from './middleware/error';
import { UPLOAD_ROOT } from './controllers/upload.controller';

// Servidor de la API en su propio puerto (modo dos procesos / desarrollo).
const app = createApiServer();
app.use(notFound); // 404 para cualquier ruta no-API
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`\n🚀 API lista en ${env.apiUrl} (puerto ${env.port}) [${env.nodeEnv}]`);
  console.log(`📂 Uploads: ${UPLOAD_ROOT}`);
});

// Cierre elegante
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

export default app;
