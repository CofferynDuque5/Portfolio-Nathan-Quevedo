import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildContactEmail, mailConfig } from '../../server/src/lib/mailer';

describe('configuración del correo', () => {
  test('sin SMTP_HOST los avisos están desactivados', () => {
    assert.equal(mailConfig({}), null);
    assert.equal(mailConfig({ SMTP_USER: 'web@x.com' }), null);
  });

  test('valores por defecto para cPanel: puerto 465 con SSL y aviso a la propia cuenta', () => {
    const cfg = mailConfig({ SMTP_HOST: 'mail.x.com', SMTP_USER: 'web@x.com', SMTP_PASS: 'p' });
    assert.deepEqual(cfg, {
      host: 'mail.x.com', port: 465, secure: true, user: 'web@x.com', pass: 'p', from: 'web@x.com', to: 'web@x.com',
    });
  });

  test('el puerto 587 usa STARTTLS y NOTIFY_EMAIL cambia el destino', () => {
    const cfg = mailConfig({ SMTP_HOST: 'mail.x.com', SMTP_PORT: '587', SMTP_USER: 'web@x.com', NOTIFY_EMAIL: 'yo@y.com' });
    assert.equal(cfg?.secure, false);
    assert.equal(cfg?.to, 'yo@y.com');
  });
});

describe('correo de aviso', () => {
  const msg = { name: 'Eve\r\nBcc: otro@x.com', email: 'eve@x.com', subject: '<script>', message: 'Hola <img src=x>' };
  const mail = buildContactEmail(msg, 'https://sitio.com/');

  test('el asunto no admite saltos de línea (no se pueden inyectar cabeceras)', () => {
    assert.doesNotMatch(mail.subject, /[\r\n]/);
  });

  test('el HTML escapa lo que escribe el visitante', () => {
    assert.ok(!mail.html.includes('<script>'));
    assert.ok(!mail.html.includes('<img src=x>'));
    assert.ok(mail.html.includes('Hola &lt;img src=x&gt;'));
  });

  test('enlaza al panel de mensajes', () => {
    assert.ok(mail.text.includes('https://sitio.com/admin/messages'));
    assert.ok(mail.html.includes('href="https://sitio.com/admin/messages"'));
  });
});
