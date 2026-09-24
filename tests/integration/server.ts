/**
 * Arranca la app completa (app.js: API + Next.js) contra una base de datos
 * de PRUEBA vacía, igual que en producción. La base se borra y se vuelve a
 * crear en cada ejecución, por eso su nombre debe contener "test".
 */
import { spawn, ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import mysql from 'mysql2/promise';

export const TEST_DB_URL = process.env.TEST_DATABASE_URL;
export const ADMIN = { email: 'admin@test.local', password: 'Test-Admin-1234' };

const ROOT = path.resolve(__dirname, '../..');

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.listen(0, () => {
      const { port } = srv.address() as { port: number };
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

/** Borra y vuelve a crear la base de prueba. */
async function resetDatabase(url: string) {
  const u = new URL(url);
  const db = decodeURIComponent(u.pathname.slice(1));
  if (!/test/i.test(db)) throw new Error(`La base de prueba debe contener "test" en su nombre (recibido: ${db}).`);
  const conn = await mysql.createConnection({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
  });
  await conn.query(`DROP DATABASE IF EXISTS \`${db}\``);
  await conn.query(`CREATE DATABASE \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
}

export interface TestServer {
  base: string;
  logs: () => string;
  stop: () => Promise<void>;
}

export async function startServer(): Promise<TestServer> {
  if (!TEST_DB_URL) throw new Error('Falta TEST_DATABASE_URL.');
  await resetDatabase(TEST_DB_URL);
  const port = await freePort();
  let output = '';
  const child: ChildProcess = spawn(process.execPath, ['app.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(port),
      DATABASE_URL: TEST_DB_URL,
      JWT_SECRET: 'test-secret-for-integration-tests-0123456789',
      ADMIN_NAME: 'Test Admin',
      ADMIN_EMAIL: ADMIN.email,
      ADMIN_PASSWORD: ADMIN.password,
      NEXT_PUBLIC_SITE_URL: 'https://example.test',
      CORS_ORIGIN: `http://127.0.0.1:${port}`,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout?.on('data', (d) => (output += d));
  child.stderr?.on('data', (d) => (output += d));

  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`La app terminó al arrancar:\n${output}`);
    try {
      const res = await fetch(`${base}/api/health`);
      if (res.ok && output.includes('en línea')) break;
    } catch {
      // aún arrancando
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  if (Date.now() >= deadline) throw new Error(`La app no respondió a tiempo:\n${output}`);

  return {
    base,
    logs: () => output,
    stop: () =>
      new Promise((resolve) => {
        if (child.exitCode !== null) return resolve();
        child.once('exit', () => resolve());
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 5000).unref();
      }),
  };
}
