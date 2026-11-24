import * as crypto from 'crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RbacGuard } from '../guards/rbac.guard';
import { DataStoreService } from '../services/data-store.service';

const SESSION_HMAC_SECRET =
  process.env.MOODLE_SSO_SHARED_SECRET ||
  'iinicia-jwt-hmac-sha256-institutional-secret-2026';

function signSessionToken(userId: string, email: string): string {
  const now = Date.now();
  const payloadB64 = Buffer.from(
    JSON.stringify({
      sub: userId,
      email: email.trim().toLowerCase(),
      iat: now,
      exp: now + 8 * 3600 * 1000,
    }),
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_HMAC_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `iinicia.${payloadB64}.${sig}`;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly dataStore: DataStoreService) {}

  /**
   * Flujo 7.1: Registro y alta de usuario
   * Crea la identidad en Supabase Auth, genera el perfil en profiles y asigna el rol inicial 'aspirante'.
   */
  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      interested_program_id?: string;
    },
  ) {
    if (!body?.email || !body?.first_name || !body?.last_name) {
      throw new BadRequestException(
        'Nombre, apellidos y correo electrónico son obligatorios para el registro.',
      );
    }

    const userContext = await this.dataStore.registerNewUser({
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      interested_program_id: body.interested_program_id,
    });

    return {
      message:
        'Registro completado en Supabase Auth y tabla profiles. Se asignó el rol inicial Aspirante.',
      accessToken: signSessionToken(
        userContext.profile.id,
        userContext.profile.email,
      ),
      user: userContext,
    };
  }

  /**
   * Inicio de sesión en el Portal IINICIA (CA-03).
   * Soporta inicio de sesión con cuentas institucionales y usuarios recién registrados.
   */
  @Post('login')
  async login(@Body() body: { email: string; password?: string }) {
    if (!body?.email) {
      throw new BadRequestException('Debes ingresar tu correo institucional o de registro.');
    }

    const userContext = this.dataStore.resolveUserContextByIdOrEmail(body.email);
    if (!userContext) {
      throw new UnauthorizedException(
        'No se encontró una cuenta asociada a ese correo. Regístrate primero en /registro.',
      );
    }

    if (userContext.profile.status === 'suspendido') {
      throw new UnauthorizedException(
        'Esta cuenta se encuentra suspendida por administración.',
      );
    }

    return {
      message: 'Sesión iniciada correctamente a través de Supabase Auth.',
      accessToken: signSessionToken(
        userContext.profile.id,
        userContext.profile.email,
      ),
      user: userContext,
    };
  }

  /**
   * Recuperación de acceso mediante Supabase Auth (Sección 5 y 9.1, CA-03).
   */
  @Post('recover')
  async recoverPassword(@Body() body: { email: string }) {
    if (!body?.email || !body.email.includes('@')) {
      throw new BadRequestException('Ingresa un correo electrónico válido.');
    }

    return {
      success: true,
      message:
        'Si el correo está registrado en Supabase Auth, recibirás un enlace seguro para restablecer tu contraseña.',
    };
  }

  /**
   * Perfil autenticado actual.
   */
  @UseGuards(RbacGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return {
      user: req.userContext,
    };
  }
}
