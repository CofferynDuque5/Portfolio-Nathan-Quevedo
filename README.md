# Portfolio Nathan Quevedo

Portfolio corporativo **premium y 100% administrable** para Nathan Quevedo: servicios digitales, licencias de software original, plataformas de streaming, suscripciones, seguridad y soporte técnico.

Construido con una arquitectura escalable y **sin depender de servicios externos** (no usa Vercel, Firebase, Supabase, Sanity, Strapi ni Decap). Se instala en **cualquier hosting con Node.js y MySQL**.

---

## ✨ Características

- **Frontend público** moderno, minimalista y responsive (modo claro/oscuro, glassmorphism, microanimaciones).
- **Panel administrativo** propio en `/admin` con login seguro (JWT + bcrypt) y **16 módulos** editables.
- **Gestor multimedia** con drag & drop, subida múltiple, optimización automática a WebP y organización por carpetas.
- **CRUD completo** en cada módulo: tabla con búsqueda, ordenamiento, paginación, crear, editar, eliminar, activar/desactivar y confirmaciones.
- **SEO** dinámico: meta tags, Open Graph, Twitter Cards, `sitemap.xml`, `robots.txt`, Schema.org (JSON-LD) y URLs amigables.
- **Optimizado para rendimiento** (compresión, imágenes WebP/AVIF, revalidación incremental).

---

## 🧱 Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, Framer Motion, React Hook Form, Swiper, Lucide React |
| Backend | Node.js, Express, Prisma ORM |
| Base de datos | MySQL |
| Autenticación | JWT + bcrypt |
| Archivos | Multer + Sharp (compresión automática) |

---

## 📁 Estructura del proyecto

```
Portfolio-Nathan-Quevedo/
├── package.json            # Monorepo (workspaces + scripts orquestadores)
├── .env.example            # Variables de entorno (copiar a .env)
├── server/                 # API REST (Express + Prisma + MySQL)
│   ├── prisma/
│   │   ├── schema.prisma   # Modelos de la base de datos
│   │   └── seed.ts         # Datos iniciales + usuario admin
│   └── src/
│       ├── index.ts        # Servidor Express
│       ├── config/         # Variables de entorno
│       ├── lib/            # Prisma + registro de recursos (CRUD genérico)
│       ├── middleware/     # Auth (JWT) y manejo de errores
│       ├── controllers/    # auth, crud genérico, uploads, público
│       └── routes/         # Definición de rutas
└── web/                    # Frontend + panel admin (Next.js 15)
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx     # Home pública
    │   │   ├── layout.tsx   # SEO / metadata dinámica
    │   │   ├── sitemap.ts   # sitemap.xml
    │   │   ├── robots.ts    # robots.txt
    │   │   └── admin/       # Panel administrativo (/admin)
    │   ├── components/
    │   │   ├── public/      # Secciones del sitio
    │   │   └── admin/       # DataTable, formularios, media picker…
    │   └── lib/             # API client, tipos, helpers, config de módulos
    └── public/uploads/      # Archivos subidos (organizados por carpeta)
```

---

## 🚀 Instalación

### 1. Requisitos

- Node.js **18.18+** (recomendado 20+)
- MySQL **8+** (o MariaDB compatible)

### 2. Clonar e instalar

```bash
git clone <repositorio>
cd Portfolio-Nathan-Quevedo
cp .env.example .env      # edita las credenciales
npm install               # instala frontend y backend (workspaces)
```

### 3. Configurar la base de datos

Crea una base de datos vacía en MySQL:

```sql
CREATE DATABASE portfolio_nathan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Y ajusta `DATABASE_URL` en tu `.env`:

```
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/portfolio_nathan"
```

### 4. Migrar y sembrar datos

Opción A — rápida (desarrollo):

```bash
npm run prisma:generate   # genera el cliente Prisma
npm run db:push           # sincroniza el esquema con MySQL
npm run seed              # crea el admin + contenido de ejemplo
```

Opción B — con migraciones versionadas (recomendado en producción):

```bash
npm run prisma:generate
npm run prisma:deploy -w server   # aplica prisma/migrations/*
npm run seed
```

> Atajo: `npm run setup` ejecuta install + generate + db:push + seed de una vez.
> Los scripts de Prisma cargan automáticamente el `.env` de la raíz (vía dotenv-cli),
> por lo que funcionan sin configuración adicional en cualquier hosting.

### 5. Arrancar

**Desarrollo** (frontend + backend con recarga en caliente):

```bash
npm run dev
```

**Producción**:

```bash
npm run build
npm start
```

- Sitio público → `http://localhost:3000`
- Panel admin → `http://localhost:3000/admin`
- API → `http://localhost:4000`

### 🔑 Credenciales por defecto

Definidas en `.env` (cámbialas en producción):

```
Email:    admin@nathanquevedo.com
Password: Admin1234!
```

---

## 🗂️ Módulos del panel administrativo

Dashboard · Hero · Servicios · Categorías · Plataformas · Licencias · FAQ · Galería · Banners · Logos · Redes sociales · Información de contacto · SEO · Configuración general · Usuarios · Multimedia · Mensajes.

Cada módulo de contenido incluye: **búsqueda, ordenamiento, paginación, crear, editar, eliminar, activar/desactivar, vista previa de imágenes y confirmación antes de borrar.**

> La arquitectura es **declarativa**: para añadir una sección nueva basta con
> registrar el modelo en `server/src/lib/resources.ts` y su configuración de
> campos en `web/src/lib/admin/resources.ts`. El resto (API + UI) es genérico.

---

## 🌐 Despliegue en hosting con Node.js + MySQL

1. Sube el proyecto al servidor.
2. Configura el `.env` con la base de datos de producción y un `JWT_SECRET` fuerte.
3. Ejecuta:
   ```bash
   npm install
   npm run build
   npm run db:push && npm run seed   # solo la primera vez
   npm start
   ```
4. (Recomendado) Usa un gestor de procesos como **PM2** y un proxy inverso (Nginx)
   para servir el frontend (`:3000`) y la API (`:4000`) bajo tu dominio.

---

## 🔒 Seguridad

- Contraseñas cifradas con **bcrypt**.
- Sesiones con **JWT** (expiración configurable).
- **Helmet**, **CORS** restringido y **rate limiting** en el login.
- Validación de datos con **Zod**.
- El panel `/admin` y `/api` quedan excluidos de la indexación (`robots.txt`).

---

## 📝 Licencia

Proyecto privado desarrollado para Nathan Quevedo.
