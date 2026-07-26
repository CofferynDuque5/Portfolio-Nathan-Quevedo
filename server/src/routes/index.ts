import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { requireAuth, requireRole } from '../middleware/auth';
import * as auth from '../controllers/auth.controller';
import * as crud from '../controllers/crud.controller';
import * as upload from '../controllers/upload.controller';
import * as pub from '../controllers/public.controller';

const router = Router();

// -------------------- Autenticación --------------------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo más tarde.' },
});

router.post('/auth/login', loginLimiter, auth.login);
router.get('/auth/me', requireAuth, auth.me);
router.post('/auth/change-password', requireAuth, auth.changePassword);

// -------------------- Público (sitio) --------------------
router.get('/public/content', pub.getSiteContent);
router.get('/public/seo/:page', pub.getSeo);
router.post('/public/contact', pub.submitContact);
router.get('/public/:resource', pub.getPublicResource);

// -------------------- Subida de archivos --------------------
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
});

router.post('/admin/upload', requireAuth, memoryUpload.array('files', 20), upload.uploadFiles);
router.delete('/admin/media/:id', requireAuth, upload.deleteMedia);

// -------------------- CRUD genérico (panel admin) --------------------
// Todas las rutas requieren autenticación. Las de usuarios requieren rol ADMIN.
router.use('/admin', requireAuth);

// El refuerzo de permisos para usuarios debe registrarse ANTES del CRUD genérico.
router.use('/admin/users', requireRole('ADMIN'));

router.get('/admin/:resource', crud.list);
router.get('/admin/:resource/:id', crud.getOne);
router.post('/admin/:resource', crud.create);
router.put('/admin/:resource/:id', crud.update);
router.patch('/admin/:resource/:id/toggle', crud.toggle);
router.delete('/admin/:resource/:id', crud.remove);

export default router;
