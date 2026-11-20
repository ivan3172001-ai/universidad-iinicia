#!/usr/bin/env node
/**
 * Inicia simultáneamente el Backend (NestJS en puerto 4000) y el Frontend (Next.js en puerto 3000).
 * Libera automáticamente los puertos 3000 y 4000 si había una instancia previa abierta.
 */
import { execSync, spawn } from 'child_process';

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function freePort(port) {
  try {
    if (isWin) {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const pids = new Set();
      for (const line of output.split(/\r?\n/)) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && /^\d+$/.test(pid) && Number(pid) !== process.pid) {
            pids.add(pid);
          }
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`✔ Puerto ${port} liberado (proceso anterior PID ${pid} cerrado).`);
        } catch {
          // Ignorar si ya terminó
        }
      }
    }
  } catch {
    // El puerto ya estaba libre
  }
}

freePort(3000);
freePort(4000);

console.log(
  '🚀 Iniciando Backend (NestJS -> http://localhost:4000/api/v1) y Frontend (Next.js -> http://localhost:3000)...\n',
);

const backend = spawn(npmCmd, ['run', 'dev:backend'], {
  stdio: 'inherit',
  shell: isWin,
});

const frontend = spawn(npmCmd, ['run', 'dev:frontend'], {
  stdio: 'inherit',
  shell: isWin,
});

process.on('SIGINT', () => {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});
