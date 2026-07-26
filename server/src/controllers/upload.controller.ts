import { Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { HttpError } from '../middleware/error';

/** Raíz absoluta donde se guardan los archivos subidos (/public/uploads). */
export const UPLOAD_ROOT = path.resolve(process.cwd(), env.uploadDir);

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

function safeFolder(folder?: string) {
  const clean = (folder ?? 'general').toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return clean || 'general';
}

/**
 * POST /api/admin/upload
 * Recibe uno o varios archivos (campo "files"), los optimiza con sharp,
 * los guarda en /public/uploads/<carpeta>/ y registra cada uno en la BD.
 */
export const uploadFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (!files.length) throw new HttpError(400, 'No se recibió ningún archivo.');

  const folder = safeFolder(req.body.folder);
  const destDir = path.join(UPLOAD_ROOT, folder);
  await fs.mkdir(destDir, { recursive: true });

  const results = [];
  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    let filename: string;
    let width: number | null = null;
    let height: number | null = null;
    let size = file.size;

    if (IMAGE_EXTS.has(ext) && ext !== '.gif') {
      // Optimización: redimensiona a un máximo y convierte a webp con calidad 82.
      filename = `${base}.webp`;
      const outputPath = path.join(destDir, filename);
      const image = sharp(file.buffer).rotate();
      const metadata = await image.metadata();
      const optimized = await image
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      await fs.writeFile(outputPath, optimized);
      width = metadata.width ?? null;
      height = metadata.height ?? null;
      size = optimized.length;
    } else {
      // Otros archivos (gif, svg, etc.) se guardan tal cual.
      filename = `${base}${ext}`;
      await fs.writeFile(path.join(destDir, filename), file.buffer);
    }

    const url = `/uploads/${folder}/${filename}`;
    const record = await prisma.mediaFile.create({
      data: {
        filename,
        originalName: file.originalname,
        url,
        path: `${folder}/${filename}`,
        mimeType: file.mimetype,
        size,
        width,
        height,
        folder,
      },
    });
    results.push(record);
  }

  res.status(201).json({ data: results });
});

/** DELETE /api/admin/media/:id — elimina el archivo físico y su registro. */
export const deleteMedia = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const record = await prisma.mediaFile.findUnique({ where: { id } });
  if (!record) throw new HttpError(404, 'Archivo no encontrado.');

  const absolute = path.join(UPLOAD_ROOT, record.path);
  await fs.unlink(absolute).catch(() => undefined); // no fallar si ya no existe
  await prisma.mediaFile.delete({ where: { id } });

  res.json({ success: true });
});
