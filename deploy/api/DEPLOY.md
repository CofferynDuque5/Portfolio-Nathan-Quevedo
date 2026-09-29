# API del portfolio (app Node.js 1 de 2)

Este zip trae **solo el backend**: la API (Express + MySQL), la preparación
automática de la base de datos y la carpeta de imágenes subidas. El sitio va
en el otro zip (`portfolio-web`). Ya viene compilado: no hace falta
`npm run build`.

**Instala primero esta app** y después el sitio.

Dominio previsto: **`__API_URL__`**. El sitio ya viene compilado para
pedir los datos ahí; si usas otra dirección, hay que recompilar el sitio.

## 1 · Base de datos MySQL

cPanel → **MySQL® Databases**: crea la base de datos, un usuario con
contraseña y dale **ALL PRIVILEGES** sobre la base. (Si no la creas, la API
intenta crearla sola al arrancar.)

## 2 · Subdominio

cPanel → **Domains** → **Create A New Domain** → `__API_HOST__`
(desmarca "Share document root"). Activa el SSL (AutoSSL o Let's Encrypt).

## 3 · Subir y extraer

Administrador de Archivos → crea una carpeta, por ejemplo `portfolio-api`,
sube el zip y **Extract**. Debe quedar `app.js` junto a `package.json`,
`server/` y `scripts/`.

## 4 · El archivo `.env`

Copia `.env.cpanel` con el nombre `.env` y cambia solo `DATABASE_URL`:

```env
DATABASE_URL="mysql://USUARIO:CONTRASENA@localhost:3306/NOMBRE_BD"
```

`INTERNAL_API_KEY` ya viene rellena y es la misma que la del sitio: no la
cambies (o cámbiala igual en las dos apps).

## 5 · Setup Node.js App

**Create Application**:

| Campo | Valor |
|-------|-------|
| Node.js version | 20.x (mínimo 18.18) |
| Application mode | Production |
| Application root | `portfolio-api` |
| Application URL | `__API_HOST__` |
| Application startup file | `app.js` |

Pulsa **Create**, luego **Run NPM Install** y al terminar **Restart**.

## 6 · Comprobar

Abre `__API_URL__/api/health`: debe responder `{"status":"ok",...}`.

La primera vez la API crea sola las tablas y el contenido. Si dejaste
`ADMIN_PASSWORD` vacío, la contraseña del panel está en
`ADMIN-PASSWORD.txt` dentro de esta carpeta: entra al panel, cámbiala y
borra ese archivo. `JWT_SECRET` vacío también vale: se crea sola una clave
segura en `.jwt-secret`.

## Notas

- **Imágenes subidas:** se guardan en `uploads/` (permisos 755).
- **Correo de avisos:** rellena `SMTP_HOST`, `SMTP_USER` y `SMTP_PASS` en el
  `.env` y pulsa Restart (los datos salen en Email Accounts → Connect Devices).
- **Recargar el contenido de ejemplo:** Setup Node.js App → Run JS script →
  `db:setup`.
- **Error 502:** revisa `DATABASE_URL` y los logs de la app.
