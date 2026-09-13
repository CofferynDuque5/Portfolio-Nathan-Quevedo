# 🚀 Desplegar en cPanel — SIN escribir comandos

> Este ZIP **ya viene compilado** (la web y la API están construidas dentro).
> No necesitas ejecutar `npm run build` ni escribir comandos en la terminal.
> Todo se hace con **botones** del panel y editando el `.env` desde el
> **Administrador de Archivos** (ahí sí puedes pegar texto).

La app corre en **un solo proceso** (`app.js`): sirve la web y la API en el
mismo dominio.

---

## Paso 1 · Crear la base de datos MySQL

cPanel → **MySQL® Databases**:

1. **Create New Database** → nombre, ej. `portfolio` (quedará `usuario_portfolio`).
2. **Add New User** → usuario + contraseña (anótalos).
3. **Add User To Database** → selecciona el usuario y la BD → **ALL PRIVILEGES**.

Anota los 3 datos: **nombre de la BD**, **usuario**, **contraseña**.

---

## Paso 2 · Subir y descomprimir el proyecto

cPanel → **Administrador de Archivos**:

1. Entra a la carpeta del dominio (o crea una carpeta, ej. `nathanquevedo`).
2. **Cargar** el ZIP y luego **Extraer** (Extract) ahí mismo.
3. Debe quedar visible el archivo **`app.js`** junto a `package.json`, `web/` y `server/`.

---

## Paso 3 · Crear el archivo `.env`

En el Administrador de Archivos, dentro de esa carpeta:

1. Si existe `.env.example`, selecciónalo → **Copy** → renómbralo a `.env`
   (o crea un archivo nuevo llamado `.env`).
2. Selecciona `.env` → **Edit** y pega esto (aquí SÍ funciona pegar), cambiando
   los datos de tu base de datos:

```env
DATABASE_URL="mysql://USUARIO:CONTRASENA@localhost:3306/NOMBRE_BD"
JWT_SECRET="pon-aqui-cualquier-clave-larga-1234567890"
NEXT_PUBLIC_SITE_URL="https://nathanquevedo.nvcorx.com"
NEXT_PUBLIC_API_URL=""
API_URL=""
CORS_ORIGIN="https://nathanquevedo.nvcorx.com"
ADMIN_EMAIL="admin@nathanquevedo.com"
ADMIN_PASSWORD="CambiaEstaClave123"
```

Guarda (**Save Changes**).

---

## Paso 4 · Registrar la app (Setup Node.js App)

cPanel → **Setup Node.js App** → **Create Application**:

| Campo | Valor |
|-------|-------|
| Node.js version | **20.x** (o la más alta; mínimo 18.18) |
| Application mode | **Production** |
| Application root | la carpeta donde está `app.js` |
| Application URL | tu dominio (`nathanquevedo.nvcorx.com`) |
| Application startup file | **`app.js`** |

Pulsa **Create**.

---

## Paso 5 · Instalar dependencias (un botón)

En la misma pantalla de la app, pulsa **Run NPM Install**.
Espera a que termine (1–3 min). Esto también genera el cliente de la base de datos
automáticamente.

---

## Paso 6 · Preparar la base de datos (un clic, sin escribir)

En la misma pantalla, sección **Run JS script**:

1. En el desplegable elige **`db:setup`**.
2. Pulsa **Run**.

Esto **crea todas las tablas y carga el contenido** (servicios, plataformas,
licencias, logos, FAQ, admin…). Verás un log terminando en `Base de datos lista`.

---

## Paso 7 · Reiniciar y abrir

Pulsa **Restart** (arriba en Setup Node.js App).

- Sitio: `https://nathanquevedo.nvcorx.com`
- Panel: `https://nathanquevedo.nvcorx.com/admin`
  (usuario y contraseña que pusiste en `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

✅ Listo. Al entrar al dominio aparece el sitio.

---

## Notas

- **Login del panel:** entra con el correo/clave del `.env`. Puedes cambiar la
  contraseña o el WhatsApp desde el propio panel (Configuración / Usuarios).
- **Cambiar el número, textos o imágenes:** todo se edita desde `/admin`. Las
  imágenes se suben desde el gestor multimedia (se optimizan solas).
- **Volver a cargar el contenido de ejemplo:** ejecuta otra vez `db:setup`
  (no borra tus tablas si ya existen; regenera el contenido base).
- **Si cambias de dominio:** el dominio va "horneado" en la compilación para el
  SEO. Si cambias de dominio, avísame y te regenero el ZIP, o recompila con
  `npm run build` tras editar `NEXT_PUBLIC_SITE_URL`.

---

## Si algo falla

- **Sigue saliendo "Index of /"** → falta el Paso 4 (registrar la Node.js App)
  o el *Application root* no apunta a la carpeta con `app.js`.
- **Error 502 / no abre** → revisa el `.env` (sobre todo `DATABASE_URL`) y mira
  los *logs* en Setup Node.js App.
- **El panel no guarda** → el usuario MySQL no tiene privilegios sobre la BD
  (repite el Paso 1.3) o `DATABASE_URL` está mal.
- **Las imágenes que subo no aparecen** → da permisos de escritura (755) a la
  carpeta `web/public/uploads`.
