# Sitio del portfolio (app Node.js 2 de 2)

Este zip trae **solo el sitio**: las páginas públicas, la versión en inglés y
el panel `/admin` (Next.js). Todos los datos los pide a la API del otro zip
(`portfolio-api`), que debe estar instalada y funcionando antes. Ya viene
compilado: no hace falta `npm run build`.

Compilado para:

- Sitio: **`__SITE_URL__`**
- API: **`__API_URL__`**

Si alguna de las dos direcciones cambia, hay que recompilar este zip.

## 1 · Subir y extraer

Administrador de Archivos → crea una carpeta, por ejemplo `portfolio-web`
(fuera de `public_html`), sube el zip y **Extract**. Debe quedar `app.js`
junto a `package.json`, `.next/` y `public/`.

## 2 · El archivo `.env`

Copia `.env.cpanel` con el nombre `.env`. Ya viene completo: la dirección de
la API y la misma `INTERNAL_API_KEY` que la API. No hay que tocar nada.

## 3 · Setup Node.js App

**Create Application**:

| Campo | Valor |
|-------|-------|
| Node.js version | 20.x (mínimo 18.18) |
| Application mode | Production |
| Application root | `portfolio-web` |
| Application URL | `__SITE_HOST__` |
| Application startup file | `app.js` |

Pulsa **Create**, luego **Run NPM Install** y al terminar **Restart**.

## 4 · Abrir

- Sitio: `__SITE_URL__`
- Panel: `__SITE_URL__/admin` (la contraseña inicial está en
  `ADMIN-PASSWORD.txt`, en la carpeta de la API).

## Si algo falla

- **Sale "Index of /"** → la app no está registrada en Setup Node.js App o
  el Application root no es la carpeta con `app.js`.
- **El sitio abre pero sin tu contenido, o el panel no entra** → la API no
  responde: abre `__API_URL__/api/health` y revisa la app de la API.
- **El formulario o el panel dan error de conexión** → en el `.env` de la API,
  `CORS_ORIGIN` debe ser `__SITE_URL__`.
