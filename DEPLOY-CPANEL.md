# 🚀 Desplegar en cPanel (LiteSpeed + Node.js)

> **Importante:** este proyecto es una **aplicación Node.js**, no un sitio de
> archivos estáticos. Si solo subes los archivos verás un *"Index of /"* (listado
> de carpetas), porque nadie está ejecutando la app. Sigue estos pasos para que
> el sitio aparezca al entrar al dominio.

La app corre en **un solo proceso** (`app.js`): sirve la web y la API en el
mismo dominio. No necesitas abrir puertos ni configurar dos servicios.

---

## 1) Crear la base de datos MySQL

En cPanel → **MySQL® Databases**:

1. Crea una base de datos (ej. `nathan_portfolio`).
2. Crea un usuario con una contraseña fuerte.
3. Añade el usuario a la base de datos con **ALL PRIVILEGES**.
4. Anota: **nombre de la BD**, **usuario** y **contraseña** (cPanel les añade un prefijo, ej. `cuenta_nathan_portfolio`).

---

## 2) Subir el proyecto

Sube y descomprime el ZIP en una carpeta de tu cuenta. Puede ser la raíz del
dominio (donde apunta `nathanquevedo.nvcorx.com`) o una carpeta aparte
(ej. `/home/usuario/nathanquevedo`). Lo importante es que dentro de esa carpeta
esté el archivo **`app.js`** junto a `package.json`, `web/` y `server/`.

> No subas `node_modules` ni `.env`: se generan/crean en el servidor.

---

## 3) Crear el archivo `.env`

En la misma carpeta, copia `.env.example` a `.env` y edítalo:

```env
DATABASE_URL="mysql://USUARIO:CONTRASENA@localhost:3306/NOMBRE_BD"
JWT_SECRET="una-clave-larga-y-aleatoria"
NEXT_PUBLIC_SITE_URL="https://nathanquevedo.nvcorx.com"

# Un solo proceso: dejar estas dos VACÍAS
NEXT_PUBLIC_API_URL=""
API_URL=""
CORS_ORIGIN="https://nathanquevedo.nvcorx.com"

ADMIN_EMAIL="admin@nathanquevedo.com"
ADMIN_PASSWORD="TuPasswordSegura"
```

---

## 4) Registrar la app en cPanel

cPanel → **Setup Node.js App** → **Create Application**:

| Campo | Valor |
|-------|-------|
| Node.js version | **20.x** (o la más alta disponible; mínimo 18.18) |
| Application mode | **Production** |
| Application root | la carpeta donde subiste el proyecto (la que contiene `app.js`) |
| Application URL | tu dominio: `nathanquevedo.nvcorx.com` |
| Application startup file | **`app.js`** |

Pulsa **Create**.

---

## 5) Instalar, compilar y preparar la base de datos

En la pantalla de la app, cPanel muestra un comando para entrar al entorno
(algo como `source /home/USUARIO/nodevenv/.../bin/activate && cd ~/carpeta`).
Ábrelo en **Terminal** (cPanel → Terminal) y ejecuta, en orden:

```bash
npm install
npm run build
npm run db:push       # crea las tablas (o: npm run prisma:deploy)
npm run seed          # crea el admin y el contenido inicial
```

> `npm run build` compila la API y el sitio. Puede tardar 1–3 minutos.

---

## 6) Reiniciar y abrir

Vuelve a **Setup Node.js App** y pulsa **Restart**.

Abre `https://nathanquevedo.nvcorx.com` → **el sitio ya aparece**.
Panel de administración: `https://nathanquevedo.nvcorx.com/admin`
(usuario y contraseña del `.env`).

---

## Actualizaciones futuras

Cuando cambies algo del código:

```bash
npm install        # solo si cambiaron dependencias
npm run build
```
Luego **Restart** en Setup Node.js App.

---

## Alternativa: compilar en tu PC (si el hosting es limitado)

Si `npm run build` falla en el servidor por poca memoria, compílalo en tu
computadora (`npm install && npm run build`) y sube también las carpetas
`web/.next` y `server/dist` ya generadas. En el servidor entonces solo necesitas:

```bash
npm install
npm run db:push && npm run seed   # solo la primera vez
```
y **Restart**.

---

## Problemas frecuentes

- **Sigo viendo "Index of /"** → no está registrada la Node.js App para ese
  dominio, o el *Application root* no apunta a la carpeta con `app.js`. Revisa el paso 4.
- **502 / la app no levanta** → revisa que `.env` tenga bien `DATABASE_URL`;
  mira los *logs* en Setup Node.js App.
- **Las imágenes que suba no aparecen** → asegúrate de que la carpeta
  `web/public/uploads` tenga permisos de escritura (755).
- **El panel no guarda / error de conexión** → normalmente `DATABASE_URL`
  incorrecta o el usuario MySQL sin privilegios sobre la BD.
