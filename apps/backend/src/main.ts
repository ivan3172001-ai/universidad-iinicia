import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Cargar variables desde .env en la raíz del proyecto si existe
for (const candidate of [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
]) {
  if (fs.existsSync(candidate)) {
    const lines = fs.readFileSync(candidate, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
    break;
  }
}

// Rate limiting ligero en memoria para endpoints sensibles (Sección 14)
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-iinicia-user'],
  });

  // Cabeceras de seguridad y Rate Limiting (Sección 14)
  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()',
    );
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    if (req.path.includes('/auth/')) {
      const ip = req.ip || 'local';
      const now = Date.now();
      const record = rateLimitBuckets.get(ip);
      if (!record || now > record.resetAt) {
        rateLimitBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
      } else {
        record.count += 1;
        if (record.count > 60) {
          return res.status(429).json({
            statusCode: 429,
            message: 'Demasiadas solicitudes en endpoints de autenticación. Intenta de nuevo en un minuto.',
          });
        }
      }
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

  const port = Number(process.env.BACKEND_PORT || 4000);
  await app.listen(port);
  console.log(`🚀 IINICIA Backend API (NestJS) ejecutándose en http://localhost:${port}/api/v1`);
}

bootstrap();
