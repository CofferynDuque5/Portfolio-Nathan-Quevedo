/**
 * Servidor SMTP mínimo para las pruebas: acepta cualquier correo y lo guarda
 * en memoria (sin TLS ni autenticación). Suficiente para nodemailer.
 */
import { createServer, Server } from 'node:net';

export interface CapturedMail {
  from: string;
  to: string[];
  data: string;
}

export interface SmtpSink {
  port: number;
  mails: CapturedMail[];
  waitFor: (count: number, timeoutMs?: number) => Promise<CapturedMail[]>;
  close: () => Promise<void>;
}

export async function startSmtpSink(): Promise<SmtpSink> {
  const mails: CapturedMail[] = [];
  const server: Server = createServer((socket) => {
    let buffer = '';
    let inData = false;
    let current: CapturedMail = { from: '', to: [], data: '' };
    const reply = (line: string) => socket.write(line + '\r\n');
    reply('220 prueba ESMTP');

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      while (true) {
        if (inData) {
          const end = buffer.indexOf('\r\n.\r\n');
          if (end === -1) return;
          current.data = buffer.slice(0, end);
          buffer = buffer.slice(end + 5);
          inData = false;
          mails.push(current);
          current = { from: '', to: [], data: '' };
          reply('250 OK');
          continue;
        }
        const nl = buffer.indexOf('\r\n');
        if (nl === -1) return;
        const line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 2);
        const cmd = line.slice(0, 4).toUpperCase();
        if (cmd === 'EHLO' || cmd === 'HELO') reply('250 prueba');
        else if (cmd === 'MAIL') {
          current.from = line.slice(10).trim();
          reply('250 OK');
        } else if (cmd === 'RCPT') {
          current.to.push(line.slice(8).trim());
          reply('250 OK');
        } else if (cmd === 'DATA') {
          inData = true;
          reply('354 Adelante');
        } else if (cmd === 'QUIT') {
          reply('221 Adiós');
          socket.end();
        } else reply('250 OK');
      }
    });
    socket.on('error', () => undefined);
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as { port: number }).port;

  return {
    port,
    mails,
    waitFor: async (count, timeoutMs = 5000) => {
      const deadline = Date.now() + timeoutMs;
      while (mails.length < count && Date.now() < deadline) await new Promise((r) => setTimeout(r, 50));
      return mails;
    },
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
