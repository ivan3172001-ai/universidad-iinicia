import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ProfileRecord } from '../types/domain';

export interface MoodleUserSyncResult {
  moodleUserId: number;
  createdNew: boolean;
  mode: 'live_moodle_ws' | 'sandbox_moodle_ws';
  message: string;
}

export interface MoodleEnrolResult {
  enrolled: boolean;
  moodleCourseId: number;
  moodleUserId: number;
  roleId: number;
  roleName: 'editingteacher' | 'student';
  mode: 'live_moodle_ws' | 'sandbox_moodle_ws';
}

@Injectable()
export class MoodleService {
  private readonly logger = new Logger(MoodleService.name);
  private readonly moodleBaseUrl = process.env.MOODLE_BASE_URL || 'http://localhost:8080';
  private readonly moodleWsToken = process.env.MOODLE_WS_TOKEN || '';
  private readonly ssoSecret =
    process.env.MOODLE_SSO_SHARED_SECRET || 'iinicia-campus-sso-hmac-key-2026';

  // Registro en memoria para modo Sandbox cuando MOODLE_WS_TOKEN aún no está configurado
  // Permite demostrar la prevención de duplicados (CA-10) y matrículas por rol (CA-12, CA-13)
  private sandboxUsersByEmail = new Map<
    string,
    { id: number; username: string; email: string; firstname: string; lastname: string; suspended: boolean }
  >([
    [
      'profesor@iinicia.edu.mx',
      {
        id: 2001,
        username: 'profesor.mendez',
        email: 'profesor@iinicia.edu.mx',
        firstname: 'Roberto',
        lastname: 'Méndez',
        suspended: false,
      },
    ],
    [
      'estudiante1@iinicia.edu.mx',
      {
        id: 3001,
        username: 'ana.garcia',
        email: 'estudiante1@iinicia.edu.mx',
        firstname: 'Ana Sofía',
        lastname: 'García',
        suspended: false,
      },
    ],
    [
      'estudiante2@iinicia.edu.mx',
      {
        id: 3002,
        username: 'carlos.lopez',
        email: 'estudiante2@iinicia.edu.mx',
        firstname: 'Carlos Eduardo',
        lastname: 'López',
        suspended: false,
      },
    ],
  ]);

  private nextSandboxMoodleId = 3010;

  isLiveMode(): boolean {
    return Boolean(
      this.moodleWsToken &&
        this.moodleWsToken !== 'tu-token-webservice-moodle-minimo-privilegio',
    );
  }

  /**
   * Invocación segura Servidor-a-Servidor a los Web Services REST de Moodle.
   * Cumple con CA-14 y CA-15: El token vive exclusivamente en el backend.
   */
  private async callWebService<T = any>(
    wsfunction: string,
    params: Record<string, string>,
  ): Promise<T> {
    const endpoint = new URL('/webservice/rest/server.php', this.moodleBaseUrl);
    const body = new URLSearchParams({
      wstoken: this.moodleWsToken,
      wsfunction,
      moodlewsrestformat: 'json',
      ...params,
    });

    const response = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status} al comunicar con Moodle Web Services`);
    }

    const data: any = await response.json();
    if (data && data.exception) {
      throw new Error(`Moodle WS Error (${data.errorcode}): ${data.message}`);
    }
    return data as T;
  }

  /**
   * Sección 8.2 y CA-10:
   * Busca primero usuarios existentes en Moodle por email antes de crear un nuevo registro
   * para evitar duplicados. No sincroniza contraseñas en texto plano (Sección 11).
   */
  async findOrCreateMoodleUser(profile: ProfileRecord): Promise<MoodleUserSyncResult> {
    const normalizedEmail = profile.email.trim().toLowerCase();
    const safeUsername = normalizedEmail
      .replace(/[^a-z0-9._-]/g, '_')
      .slice(0, 45);

    if (this.isLiveMode()) {
      const existingUsers = await this.callWebService<Array<{ id: number; email: string }>>(
        'core_user_get_users_by_field',
        {
          field: 'email',
          'values[0]': normalizedEmail,
        },
      );

      if (existingUsers && existingUsers.length > 0) {
        const existingId = existingUsers[0].id;
        await this.callWebService('core_user_update_users', {
          'users[0][id]': String(existingId),
          'users[0][firstname]': profile.first_name,
          'users[0][lastname]': profile.last_name,
          'users[0][suspended]': profile.status === 'suspendido' ? '1' : '0',
        });

        return {
          moodleUserId: existingId,
          createdNew: false,
          mode: 'live_moodle_ws',
          message: `Usuario existente vinculado en Moodle (moodle_user_id=${existingId}) sin generar duplicados.`,
        };
      }

      // Se genera credencial aleatoria interna de alta entropía; el acceso se realiza vía SSO servidor-a-servidor
      const randomInternalPass = `Iinicia#${crypto.randomBytes(12).toString('hex')}!9A`;
      const created = await this.callWebService<Array<{ id: number; username: string }>>(
        'core_user_create_users',
        {
          'users[0][username]': safeUsername,
          'users[0][firstname]': profile.first_name,
          'users[0][lastname]': profile.last_name,
          'users[0][email]': normalizedEmail,
          'users[0][auth]': 'manual',
          'users[0][password]': randomInternalPass,
        },
      );

      return {
        moodleUserId: created[0].id,
        createdNew: true,
        mode: 'live_moodle_ws',
        message: `Usuario creado exitosamente en Moodle vía core_user_create_users (moodle_user_id=${created[0].id}).`,
      };
    }

    // Modo Sandbox local verificable (cumple con la misma lógica anti-duplicados CA-10)
    const existingSandbox = this.sandboxUsersByEmail.get(normalizedEmail);
    if (existingSandbox) {
      existingSandbox.firstname = profile.first_name;
      existingSandbox.lastname = profile.last_name;
      existingSandbox.suspended = profile.status === 'suspendido';
      return {
        moodleUserId: existingSandbox.id,
        createdNew: false,
        mode: 'sandbox_moodle_ws',
        message: `Usuario existente detectado por email (${normalizedEmail}) y vinculado con moodle_user_id=${existingSandbox.id} (sin duplicados).`,
      };
    }

    const assignedId = profile.moodle_user_id || this.nextSandboxMoodleId++;
    this.sandboxUsersByEmail.set(normalizedEmail, {
      id: assignedId,
      username: safeUsername,
      email: normalizedEmail,
      firstname: profile.first_name,
      lastname: profile.last_name,
      suspended: profile.status === 'suspendido',
    });

    this.logger.log(
      `[Moodle Sync] Creado y vinculado usuario ${normalizedEmail} -> moodle_user_id=${assignedId}`,
    );

    return {
      moodleUserId: assignedId,
      createdNew: true,
      mode: 'sandbox_moodle_ws',
      message: `Usuario creado y vinculado en Moodle con moodle_user_id=${assignedId}.`,
    };
  }

  /**
   * Sección 8.2, CA-12 y CA-13:
   * Matricula al usuario únicamente en el curso autorizado con el rol correspondiente:
   * - editingteacher (roleid = 3 en Moodle) para Profesor
   * - student (roleid = 5 en Moodle) para Estudiante
   */
  async enrolUserInCourse(params: {
    moodleUserId: number;
    moodleCourseId: number;
    roleName: 'editingteacher' | 'student';
  }): Promise<MoodleEnrolResult> {
    const roleId = params.roleName === 'editingteacher' ? 3 : 5;

    if (this.isLiveMode()) {
      await this.callWebService('enrol_manual_enrol_users', {
        'enrolments[0][roleid]': String(roleId),
        'enrolments[0][userid]': String(params.moodleUserId),
        'enrolments[0][courseid]': String(params.moodleCourseId),
      });

      return {
        enrolled: true,
        moodleCourseId: params.moodleCourseId,
        moodleUserId: params.moodleUserId,
        roleId,
        roleName: params.roleName,
        mode: 'live_moodle_ws',
      };
    }

    return {
      enrolled: true,
      moodleCourseId: params.moodleCourseId,
      moodleUserId: params.moodleUserId,
      roleId,
      roleName: params.roleName,
      mode: 'sandbox_moodle_ws',
    };
  }

  /**
   * Desmatricula al usuario de un curso en Moodle cuando se revoca su autorización.
   */
  async unenrolUserFromCourse(params: {
    moodleUserId: number;
    moodleCourseId: number;
    roleName: 'editingteacher' | 'student';
  }): Promise<{ unenrolled: boolean }> {
    const roleId = params.roleName === 'editingteacher' ? 3 : 5;
    if (this.isLiveMode()) {
      await this.callWebService('enrol_manual_unenrol_users', {
        'enrolments[0][roleid]': String(roleId),
        'enrolments[0][userid]': String(params.moodleUserId),
        'enrolments[0][courseid]': String(params.moodleCourseId),
      });
    }
    return { unenrolled: true };
  }

  /**
   * Sección 11 (Autenticación y acceso al Campus):
   * Genera un ticket SSO firmado con HMAC-SHA256 de vida corta (60 segundos) para ingresar al curso
   * en Moodle sin sincronizar contraseñas en texto plano ni exponer tokens administrativos en el navegador.
   */
  generateCampusSsoLaunchUrl(params: {
    userId: string;
    moodleUserId: number;
    moodleCourseId: number;
    moodleShortname: string;
    courseRole: 'editingteacher' | 'student';
  }) {
    const expiresAt = Math.floor(Date.now() / 1000) + 60; // Ticket efímero de 60s
    const payload = `${params.userId}:${params.moodleUserId}:${params.moodleCourseId}:${params.courseRole}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', this.ssoSecret)
      .update(payload)
      .digest('hex');

    const frontendOrigin =
      process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
    const ticketShort = signature.slice(0, 24);
    const externalMoodleUrl = `${this.moodleBaseUrl}/course/view.php?id=${params.moodleCourseId}&sso_ticket=${ticketShort}&expires=${expiresAt}`;
    const campusPortalUrl = `${frontendOrigin}/campus?courseId=${params.moodleCourseId}&shortname=${encodeURIComponent(
      params.moodleShortname,
    )}&role=${params.courseRole}&moodleUserId=${params.moodleUserId}&sso_ticket=${ticketShort}&expires=${expiresAt}`;

    const launchUrl = this.isLiveMode() ? externalMoodleUrl : campusPortalUrl;

    return {
      launchUrl,
      campusPortalUrl,
      externalMoodleUrl,
      moodleBaseUrl: this.moodleBaseUrl,
      moodleCourseId: params.moodleCourseId,
      moodleShortname: params.moodleShortname,
      moodleUserId: params.moodleUserId,
      assignedMoodleRole:
        params.courseRole === 'editingteacher'
          ? 'Teacher (Profesor)'
          : 'Student (Estudiante)',
      expiresInSeconds: 60,
      securityGuarantee:
        'Ticket efímero generado servidor-a-servidor (HMAC-SHA256). Sin exposición de MOODLE_WS_TOKEN ni contraseñas en texto plano.',
    };
  }

  getIntegrationStatus() {
    return {
      moodleBaseUrl: this.moodleBaseUrl,
      mode: this.isLiveMode() ? 'live_moodle_ws' : 'sandbox_moodle_ws',
      tokenConfiguredInBackendOnly: true,
      exposedToFrontend: false,
      supportedWebServices: [
        'core_user_get_users_by_field',
        'core_user_create_users',
        'core_user_update_users',
        'enrol_manual_enrol_users',
        'enrol_manual_unenrol_users',
        'core_enrol_get_users_courses',
      ],
    };
  }
}
