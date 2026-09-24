/**
 * Pruebas de extremo a extremo de la API y de las páginas (sin navegador).
 * Requieren una base MySQL/MariaDB de prueba: TEST_DATABASE_URL=mysql://…/…_test
 * y la app compilada (npm run build).
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN, startServer, TestServer, TEST_DB_URL } from './server';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

describe('app completa', { skip: TEST_DB_URL ? false : 'define TEST_DATABASE_URL para ejecutar estas pruebas' }, () => {
  let app: TestServer;
  let token = '';

  const api = async (path: string, init: RequestInit & { auth?: boolean } = {}) => {
    const res = await fetch(`${app.base}/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': UA,
        ...(init.auth ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
    const text = await res.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return { status: res.status, body };
  };
  const json = (data: unknown) => JSON.stringify(data);
  const page = async (path: string) => {
    const res = await fetch(`${app.base}${path}`, { redirect: 'manual', headers: { 'User-Agent': UA } });
    return { status: res.status, html: await res.text(), location: res.headers.get('location'), type: res.headers.get('content-type') };
  };

  before(async () => {
    app = await startServer();
  });
  after(async () => {
    await app?.stop();
  });

  describe('instalación', () => {
    test('una base vacía se prepara sola: tablas, contenido y traducciones', async () => {
      assert.match(app.logs(), /migración\(es\) aplicada/);
      assert.match(app.logs(), /traducciones al inglés del contenido base/);
      const health = await api('/health');
      assert.equal(health.status, 200);
    });
  });

  describe('contenido público', () => {
    test('español por defecto', async () => {
      const { status, body } = await api('/public/content');
      assert.equal(status, 200);
      assert.equal(body.settings.tagline, 'Servicios y Licencias Digitales Premium');
      assert.equal(body.services.length, 10);
      assert.equal(body.services.find((s: any) => s.slug === 'windows').title, 'Licencias Microsoft Windows');
    });

    test('con ?lang=en se sirve la traducción, también de la categoría incluida', async () => {
      const { body } = await api('/public/content?lang=en');
      assert.equal(body.settings.tagline, 'Premium Digital Services and Licenses');
      const windows = body.services.find((s: any) => s.slug === 'windows');
      assert.equal(windows.title, 'Microsoft Windows Licenses');
      assert.equal(windows.category.name, 'Licenses');
      assert.equal(body.faqs[0].question, 'Are the licenses genuine?');
      // Lo que no es texto (ni se traduce) no cambia.
      assert.equal(body.settings.whatsapp, (await api('/public/content')).body.settings.whatsapp);
    });

    test('SEO por idioma', async () => {
      const es = await api('/public/seo/servicios');
      const en = await api('/public/seo/servicios?lang=en');
      assert.equal(es.body.data.title, 'Servicios: streaming, licencias y soporte');
      assert.equal(en.body.data.title, 'Services: streaming, licenses and support');
    });
  });

  describe('formulario de contacto y métricas', () => {
    test('el formulario valida y guarda el mensaje', async () => {
      const bad = await api('/public/contact', { method: 'POST', body: json({ name: 'A', email: 'x', message: 'hola' }) });
      assert.equal(bad.status, 400);
      const ok = await api('/public/contact', {
        method: 'POST',
        body: json({ name: 'Ana Prueba', email: 'ana@example.com', message: 'Quiero una cotización.' }),
      });
      assert.equal(ok.status, 201);
    });

    test('las métricas descartan bots y el panel, y exigen login para leerlas', async () => {
      const event = (path: string, ua = UA) =>
        api('/public/track', {
          method: 'POST',
          headers: { 'User-Agent': ua },
          body: json({ type: 'pageview', path, visitorId: 'visitor-0001', sessionId: 'session-0001' }),
        });
      assert.equal((await event('/servicios?utm=x')).status, 204);
      assert.equal((await event('/en/services')).status, 204);
      assert.equal((await event('/servicios', 'Googlebot/2.1')).status, 204);
      assert.equal((await event('/admin')).status, 204);

      assert.equal((await api('/admin/analytics?days=7')).status, 401);
    });
  });

  describe('panel', () => {
    test('sin sesión no se puede leer ni traducir', async () => {
      assert.equal((await api('/admin/services')).status, 401);
      assert.equal((await api('/admin/translations/services/1?locale=en')).status, 401);
    });

    test('inicio de sesión del administrador', async () => {
      const { status, body } = await api('/auth/login', { method: 'POST', body: json(ADMIN) });
      assert.equal(status, 200);
      token = body.token;
      assert.ok(token);
    });

    test('las métricas guardan solo visitas válidas y sin parámetros', async () => {
      const { status, body } = await api('/admin/analytics?days=7', { auth: true });
      assert.equal(status, 200);
      assert.equal(body.totals.pageviews, 2);
      const paths = body.pages.map((p: any) => p.label).sort();
      assert.deepEqual(paths, ['/en/services', '/servicios']);
    });
  });

  describe('proyectos y traducciones', () => {
    let id = 0;

    test('un proyecto nuevo es un borrador y no se ve en el sitio', async () => {
      const created = await api('/admin/projects', {
        method: 'POST',
        auth: true,
        body: json({ title: 'Caso de prueba', summary: 'Resumen en español.', challenge: 'El reto.', tags: 'Prueba' }),
      });
      assert.equal(created.status, 201);
      assert.equal(created.body.data.slug, 'caso-de-prueba');
      assert.equal(created.body.data.status, 'DRAFT');
      id = created.body.data.id;
      assert.equal((await api('/public/projects/caso-de-prueba')).status, 404);
    });

    test('el slug no se puede repetir', async () => {
      const dup = await api('/admin/projects', { method: 'POST', auth: true, body: json({ title: 'Caso de prueba' }) });
      assert.equal(dup.status, 409);
    });

    test('al publicarlo aparece en el sitio con fecha', async () => {
      const pub = await api(`/admin/projects/${id}/publish`, { method: 'PATCH', auth: true, body: json({ published: true }) });
      assert.equal(pub.body.data.status, 'PUBLISHED');
      assert.ok(pub.body.data.publishedAt);
      const list = await api('/public/projects');
      assert.ok(list.body.data.some((p: any) => p.slug === 'caso-de-prueba'));
    });

    test('la traducción se guarda y el sitio en inglés la usa', async () => {
      const saved = await api(`/admin/translations/projects/${id}`, {
        method: 'PUT',
        auth: true,
        body: json({ locale: 'en', values: { title: 'Test case', summary: 'Summary in English.' } }),
      });
      assert.equal(saved.status, 200);
      assert.deepEqual(saved.body.values, { title: 'Test case', summary: 'Summary in English.' });
      assert.ok(saved.body.fields.includes('challenge'));

      const en = await api('/public/projects/caso-de-prueba?lang=en');
      assert.equal(en.body.data.title, 'Test case');
      assert.equal(en.body.data.challenge, 'El reto.'); // sin traducir: español
      const es = await api('/public/projects/caso-de-prueba');
      assert.equal(es.body.data.title, 'Caso de prueba');
    });

    test('un campo vacío borra su traducción (vuelve el español)', async () => {
      await api(`/admin/translations/projects/${id}`, {
        method: 'PUT',
        auth: true,
        body: json({ locale: 'en', values: { summary: '' } }),
      });
      const en = await api('/public/projects/caso-de-prueba?lang=en');
      assert.equal(en.body.data.summary, 'Resumen en español.');
      assert.equal(en.body.data.title, 'Test case');
    });

    test('se rechazan idiomas, campos y ajustes no traducibles', async () => {
      const put = (path: string, body: unknown) =>
        api(`/admin/translations/${path}`, { method: 'PUT', auth: true, body: json(body) });
      assert.equal((await put(`projects/${id}`, { locale: 'es', values: { title: 'x' } })).status, 400);
      assert.equal((await put(`projects/${id}`, { locale: 'en', values: { slug: 'x' } })).status, 400);
      assert.equal((await put('projects/999999', { locale: 'en', values: { title: 'x' } })).status, 404);

      const settings = await api('/admin/settings?perPage=100', { auth: true });
      const whatsapp = settings.body.data.find((s: any) => s.key === 'whatsapp');
      const aboutText = settings.body.data.find((s: any) => s.key === 'aboutText');
      assert.equal((await api(`/admin/translations/settings/${whatsapp.id}?locale=en`, { auth: true })).status, 400);
      const about = await api(`/admin/translations/settings/${aboutText.id}?locale=en`, { auth: true });
      assert.equal(about.status, 200);
      assert.match(about.body.values.value, /^Specialist in digital solutions/);
    });

    test('las páginas en inglés muestran el proyecto traducido', async () => {
      const list = await page('/en/projects');
      assert.equal(list.status, 200);
      assert.match(list.html, /Test case/);
      assert.match(list.html, /href="\/en\/projects\/caso-de-prueba"/);
      const detail = await page('/en/projects/caso-de-prueba');
      assert.equal(detail.status, 200);
      assert.match(detail.html, /<h1[^>]*>Test case<\/h1>/);
      assert.match(detail.html, /The challenge/);
    });

    test('al borrar el proyecto se borran sus traducciones', async () => {
      assert.equal((await api(`/admin/projects/${id}`, { method: 'DELETE', auth: true })).status, 200);
      // Un proyecto nuevo con el mismo id no puede heredarlas: el registro ya no existe.
      assert.equal((await api(`/admin/translations/projects/${id}?locale=en`, { auth: true })).status, 404);
      assert.equal((await page('/en/projects/caso-de-prueba')).status, 404);
    });
  });

  describe('páginas del sitio', () => {
    test('español: sin prefijo, lang="es" y enlace a la versión en inglés', async () => {
      const home = await page('/');
      assert.equal(home.status, 200);
      assert.match(home.html, /<html lang="es"/);
      assert.match(home.html, /hrefLang="en" href="[^"]*\/en"/i);
      assert.match(home.html, /Servicios y Licencias Digitales Premium/);
      const services = await page('/servicios');
      assert.match(services.html, /Streaming, software y soporte, con garantía/);
    });

    test('inglés: /en con rutas traducidas y lang="en"', async () => {
      const home = await page('/en');
      assert.equal(home.status, 200);
      assert.match(home.html, /<html lang="en"/);
      assert.match(home.html, /Premium Digital Services and Licenses/);
      assert.match(home.html, /property="og:locale" content="en_US"/);
      for (const [path, text] of [
        ['/en/services', 'Streaming, software and support, guaranteed'],
        ['/en/about', 'How I can help you'],
        ['/en/contact', 'Let&#x27;s talk about your project'],
        ['/en/projects', 'Projects that speak for themselves'],
      ]) {
        const res = await page(path);
        assert.equal(res.status, 200, path);
        assert.ok(res.html.includes(text), `${path}: falta "${text}"`);
        assert.match(res.html, /<html lang="en"/, path);
      }
    });

    test('redirecciones y 404 por idioma', async () => {
      const spanishSegment = await page('/en/servicios');
      assert.equal(spanishSegment.status, 308);
      assert.match(spanishSegment.location ?? '', /\/en\/services$/);
      const adminUnderEn = await page('/en/admin');
      assert.ok([307, 308].includes(adminUnderEn.status));
      assert.match(adminUnderEn.location ?? '', /\/admin$/);
      const missing = await page('/en/no-existe');
      assert.equal(missing.status, 404);
      assert.match(missing.html, /Page not found/);
    });

    test('sitemap con cada página en los dos idiomas', async () => {
      const sitemap = await page('/sitemap.xml');
      assert.equal(sitemap.status, 200);
      assert.match(sitemap.html, /<loc>[^<]*\/en\/services<\/loc>/);
      assert.match(sitemap.html, /<loc>[^<]*\/servicios<\/loc>/);
      assert.match(sitemap.html, /hreflang="en" href="[^"]*\/en\/about"/);
    });

    test('imagen para redes en cada idioma', async () => {
      for (const lang of ['es', 'en']) {
        const og = await fetch(`${app.base}/og?lang=${lang}`);
        assert.equal(og.status, 200);
        assert.equal(og.headers.get('content-type'), 'image/png');
      }
    });
  });
});
