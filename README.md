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
- **Español e inglés**: versión en inglés en `/en` con selector de idioma, y traducción del contenido desde el panel.

---

## 🧱 Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS (animaciones con CSS), React Hook Form, Lucide React |
| Backend | Node.js, Express, Prisma ORM |
| Base de datos | MySQL |
| Autenticación | JWT + bcrypt |
| Archivos | Multer + Sharp (compresión automática) |

---

## 📁 Estructura del proyecto

```
Portfolio-Nathan-Quevedo/
├── package.json            # Monorepo (workspaces + scripts orquestadores)
├── tests/                  # Pruebas unitarias y de integración (npm test)
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
    │   ├── i18n/            # Idiomas: configuración y diccionarios de textos
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

**Producción (un solo proceso — recomendado)**

Un único proceso sirve la web y la API en el mismo dominio (`app.js`):

```bash
npm run build
npm start          # ejecuta node app.js
```

- Sitio público → `http://localhost:3000` (o el `PORT` que definas)
- Panel admin → `http://localhost:3000/admin`
- API → `http://localhost:3000/api`

> 🏷️ **¿Vas a subirlo a cPanel / hosting con Node.js?** Sigue la guía paso a
> paso en **[`DEPLOY-CPANEL.md`](./DEPLOY-CPANEL.md)**.

**Desarrollo** (frontend + backend por separado, con recarga en caliente):

```bash
npm run dev
```
> Para `npm run dev` ajusta el `.env` a la sección de desarrollo (ver comentarios
> en `.env.example`: `API_URL`/`NEXT_PUBLIC_API_URL` = `http://localhost:4000`).

### 🔑 Credenciales por defecto

Definidas en `.env` (cámbialas en producción):

```
Email:    admin@nathanquevedo.com
Password: Admin1234!
```

---

## 🗂️ Módulos del panel administrativo

Dashboard · **Métricas** · **Proyectos** · Hero · Servicios · Categorías · Plataformas · Licencias · FAQ · Galería · Banners · Logos · Redes sociales · Información de contacto · SEO · Configuración general · Usuarios · Multimedia · Mensajes.

Los mensajes del formulario pueden llegarte también por correo (opcional, con una cuenta SMTP de tu dominio): ver `DEPLOY-CPANEL.md`.

Cada módulo de contenido incluye: **búsqueda, ordenamiento, paginación, crear, editar, eliminar, activar/desactivar, vista previa de imágenes y confirmación antes de borrar.**

### 🧭 Páginas del sitio

| Ruta | Contenido | Clave SEO (panel) |
|------|-----------|-------------------|
| `/` | Home con todas las secciones | `home` |
| `/servicios` | Streaming primero, servicios por categoría, licencias y proceso | `servicios` |
| `/proyectos` y `/proyectos/<slug>` | Portfolio y casos de estudio | `proyectos` (el detalle usa el SEO de cada proyecto) |
| `/sobre-mi` | Texto *Sobre mí* (Configuración general), áreas, proceso y proyectos | `sobre-mi` |
| `/contacto` | Formulario, WhatsApp, redes y FAQ | `contacto` |

Si una página no tiene registro en el módulo SEO se usan un título y una descripción por defecto.

### 📁 Proyectos / casos de estudio

- Cada proyecto se crea como **borrador** y solo aparece en el sitio al **publicarlo**
  (botón 🌐 de la tabla o desde la vista previa). Despublicar lo devuelve a borrador.
- Pestañas **Todos / Borradores / Publicados**, fecha de publicación (se fija sola al
  publicar si está vacía) y opción **Destacado** para mostrarlo primero.
- **Vista previa** (icono de escáner o botón *Guardar y previsualizar*): muestra el caso
  exactamente como se verá publicado, incluidos los borradores.
- Textos del caso (reto, solución, resultados): una línea en blanco separa párrafos y las
  líneas que empiezan por `- ` forman listas. La galería es una URL de imagen por línea.
- Sitio público: `/proyectos` (filtros por categoría, compartibles con `?categoria=slug`),
  `/proyectos/<slug>` (SEO, Open Graph y Schema.org por proyecto) y una sección en la home.
- La primera instalación crea dos proyectos **[Ejemplo]** como borradores; reemplázalos o
  elimínalos. Nunca se publican solos.

### 📊 Métricas y privacidad

- Aviso de privacidad propio: la medición solo empieza si el visitante pulsa **Aceptar**.
  Si rechaza, o su navegador envía *Global Privacy Control* / *Do Not Track*, no se envía
  nada. El enlace **Preferencias de privacidad** del pie permite cambiar la elección.
- Se registran páginas vistas, clics en cualquier enlace de WhatsApp y formularios de
  contacto enviados. **Sin cookies ni IP**: un identificador aleatorio en el navegador,
  la ruta sin parámetros, el dominio de procedencia (o `utm_source`) y el tipo de
  dispositivo y navegador.
- Panel **Métricas** (`/admin/analytics`): visitantes, páginas vistas, clics en WhatsApp,
  formularios, porcentaje de visitas con conversión, evolución diaria, páginas más vistas,
  fuentes de tráfico, dispositivos y navegadores, para 7, 30 o 90 días.
- Los eventos se borran automáticamente a los 13 meses.

### 🌍 Idiomas (español e inglés)

El sitio público está en **español** (`/servicios`, `/proyectos`…) y en **inglés**
bajo `/en` con rutas traducidas: `/en/services`, `/en/projects`, `/en/about`,
`/en/contact`. El botón **ES / EN** del menú lleva a la misma página en el otro idioma.
El panel `/admin` sigue en español.

- **Textos fijos** (menú, botones, formulario, aviso de privacidad, SEO por defecto…):
  `web/src/i18n/dictionaries/es.ts` y `en.ts`. El tipo `Dictionary` obliga a que los
  dos tengan las mismas claves, así que `npm run build` avisa si falta una traducción.
- **Contenido del panel**: al editar un servicio, proyecto, FAQ, categoría, plataforma,
  licencia, banner, dato de contacto, página SEO o texto de Configuración general
  (eslogan, textos de Sobre mí y título del proceso), la pestaña **English** guarda su
  versión en inglés. **Lo que no se traduce se muestra en español**. Las traducciones se
  guardan en la tabla `content_translations`.
- **Contenido base**: al actualizar, los textos de ejemplo que no editaste reciben su
  traducción al inglés automáticamente (una sola vez). Lo que ya editaste queda en
  español hasta que lo traduzcas en la pestaña English.
- **SEO**: `<html lang>`, `og:locale`, la imagen para redes (`/og?lang=en`), las
  etiquetas `hreflang` y `sitemap.xml` (una entrada por página e idioma) salen de
  `web/src/i18n/config.ts`.
- **Cómo funciona**: `src/middleware.ts` reescribe `/en/...` a la página real y marca el
  idioma; los componentes de servidor usan `getI18n()` y los de cliente `useI18n()`
  (textos, idioma y `href()` para enlaces en el idioma actual). La API acepta `?lang=en`.

**Añadir otro idioma**: crea su diccionario, añádelo en `config.ts` (`LOCALES`,
`LOCALE_META`, `ROUTE_SEGMENTS`) y en `dictionaries/index.ts`, amplía el `matcher` de
`middleware.ts` y añade el idioma a `TRANSLATION_LOCALES` en
`server/src/lib/translations.ts`.

> **Actualizaciones de la base de datos:** al reiniciar la app se aplican solas las
> migraciones nuevas de `server/prisma/migrations` (registro en la tabla
> `_app_migrations`), sin tocar el contenido existente.

> La arquitectura es **declarativa**: para añadir una sección nueva basta con
> registrar el modelo en `server/src/lib/resources.ts` y su configuración de
> campos en `web/src/lib/admin/resources.ts`. El resto (API + UI) es genérico.

---

## 🧪 Pruebas

```bash
npm run build                 # las pruebas de integración usan la app compilada
npm run test:unit             # rutas de idioma, diccionarios, reglas de proyectos y métricas
TEST_DATABASE_URL="mysql://usuario:clave@127.0.0.1:3306/portfolio_test" npm run test:integration
npm test                      # tipos + unitarias + integración
```

- **Unitarias** (`tests/unit`): no necesitan base de datos.
- **Integración** (`tests/integration`): arrancan la app completa (`app.js`) contra una
  base **de prueba vacía**, igual que en producción, y comprueban la API, el panel
  (proyectos, publicación, traducciones, métricas) y las páginas en español e inglés.
  La base indicada en `TEST_DATABASE_URL` **se borra y se vuelve a crear** en cada
  ejecución; por seguridad su nombre debe contener `test`. Sin esa variable se omiten.
- **CI**: `.github/workflows/ci.yml` compila y ejecuta todas las pruebas con MySQL 8 en
  cada pull request.

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
