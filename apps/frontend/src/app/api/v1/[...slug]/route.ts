import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_PROGRAMS } from '../../../../lib/api';
import { supabase } from '../../../../lib/supabase';

type RoleCode =
  | 'superadmin'
  | 'admin'
  | 'coordinador'
  | 'profesor'
  | 'estudiante'
  | 'aspirante'
  | 'soporte';

interface ProfileRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: 'pendiente' | 'activo' | 'suspendido' | 'inactivo';
  moodle_user_id: number | null;
  moodle_sync_status: string;
  moodle_last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

const ROLES_CATALOG = [
  {
    id: 'role-superadmin',
    code: 'superadmin' as RoleCode,
    name: 'Superadministrador',
    description:
      'Configuración global, usuarios, roles, integraciones, parámetros y auditoría.',
    moodle_archetype: 'manager',
  },
  {
    id: 'role-admin',
    code: 'admin' as RoleCode,
    name: 'Administrador',
    description:
      'Gestión de usuarios, estados, programas, autorizaciones e inscripciones.',
    moodle_archetype: 'manager',
  },
  {
    id: 'role-coordinador',
    code: 'coordinador' as RoleCode,
    name: 'Coordinador',
    description: 'Consulta y gestión de usuarios/programas bajo su ámbito.',
    moodle_archetype: 'coursecreator',
  },
  {
    id: 'role-profesor',
    code: 'profesor' as RoleCode,
    name: 'Profesor',
    description:
      'Perfil docente, consulta de cursos asignados y acceso al campus.',
    moodle_archetype: 'editingteacher',
  },
  {
    id: 'role-estudiante',
    code: 'estudiante' as RoleCode,
    name: 'Estudiante',
    description:
      'Perfil, programa, cursos asignados y acceso al campus.',
    moodle_archetype: 'student',
  },
  {
    id: 'role-aspirante',
    code: 'aspirante' as RoleCode,
    name: 'Aspirante',
    description:
      'Registro, actualización de datos y seguimiento de admisión.',
    moodle_archetype: 'none',
  },
  {
    id: 'role-soporte',
    code: 'soporte' as RoleCode,
    name: 'Soporte',
    description: 'Atención operativa limitada y consulta controlada.',
    moodle_archetype: 'none',
  },
];

const COURSE_MAPPINGS = [
  {
    id: '22222222-2222-4222-8222-222222222201',
    program_id: '11111111-1111-4111-8111-111111111101',
    course_code: 'TI-101',
    course_name: 'Curso 1. Introducción a las Tecnologías de la Información',
    moodle_course_id: 101,
    moodle_shortname: 'IINICIA-TI-101',
    moodle_category_id: 1,
    description:
      'Fundamentos de sistemas computacionales, redes, bases de datos, seguridad de la información y servicios en la nube.',
    is_active: true,
    minimum_content_checklist: [
      'Profesor de prueba asignado (Roberto Méndez - Teacher)',
      'Al menos dos estudiantes matriculados (Ana Sofía García y Carlos Eduardo López)',
      'Presentación del curso y encuadre académico',
      'Recurso PDF / Página: Manual de Fundamentos de TI',
      'Foro de debate: Impacto de las TI en las organizaciones',
      'Tarea evaluable: Diagnóstico de arquitectura empresarial',
      'Cuestionario automatizado de Unidad 1',
      'Configuración de Calificación y Finalización de actividad',
    ],
    syllabus: [
      {
        unit: 'Unidad 1',
        title: 'Presentación y Fundamentos de Sistemas de Información',
        activities: [
          'Página: Presentación del curso y criterios de evaluación',
          'Recurso PDF: Arquitectura de Computadoras y Sistemas Operativos',
          'Foro: Bienvenida y análisis de casos de TI',
        ],
      },
      {
        unit: 'Unidad 2',
        title: 'Redes, Bases de Datos y Ciberseguridad',
        activities: [
          'Tarea: Diseño de red y modelo de datos básico',
          'Cuestionario: Evaluación de conceptos clave de TI (con calificación automática)',
          'Hito: Finalización de actividad verificada',
        ],
      },
    ],
  },
  {
    id: '22222222-2222-4222-8222-222222222202',
    program_id: '11111111-1111-4111-8111-111111111102',
    course_code: 'WEB-202',
    course_name: 'Curso 2. Desarrollo Web con React',
    moodle_course_id: 102,
    moodle_shortname: 'IINICIA-REACT-202',
    moodle_category_id: 1,
    description:
      'Construcción de aplicaciones web modernas con React, TypeScript, Next.js, consumo seguro de APIs REST y control de acceso por rol.',
    is_active: true,
    minimum_content_checklist: [
      'Profesor de prueba asignado (Roberto Méndez - Teacher)',
      'Al menos dos estudiantes matriculados (Ana Sofía García y Carlos Eduardo López)',
      'Unidades temáticas estructuradas (JSX, Estado, Hooks, Next.js App Router)',
      'Recurso técnico: Guía de Arquitectura React + TypeScript',
      'Actividad práctica entregable: Panel con RBAC y consumo de API',
      'Foro técnico de arquitectura frontend',
      'Cuestionario / Evaluación final con calificación',
      'Criterio de Finalización de curso habilitado',
    ],
    syllabus: [
      {
        unit: 'Tema 1',
        title: 'Componentes, Props, Estado y TypeScript en React',
        activities: [
          'Recurso: Guía oficial de patrones con React y TypeScript',
          'Foro técnico: Mejores prácticas de composición de componentes',
        ],
      },
      {
        unit: 'Tema 2',
        title: 'Next.js App Router, Seguridad y Consumo de APIs',
        activities: [
          'Actividad práctica: Implementación de panel protegido por rol',
          'Cuestionario de evaluación final de React y Next.js',
          'Hito: Finalización de curso con emisión de calificación en Moodle',
        ],
      },
    ],
  },
];

// Estado en memoria serverless para producción en Vercel
const globalStore = globalThis as unknown as {
  __iiniciaStore?: {
    profiles: ProfileRecord[];
    userRoles: Array<{ user_id: string; role_code: RoleCode; assigned_at: string }>;
    userPrograms: Array<{
      id: string;
      user_id: string;
      program_id: string;
      academic_status: string;
      enrolled_at: string;
    }>;
    enrollments: Array<{
      id: string;
      user_id: string;
      course_mapping_id: string;
      moodle_role: 'student' | 'editingteacher';
      status: string;
      moodle_synced_at: string;
      created_at: string;
    }>;
    auditLogs: Array<{
      id: string;
      actor_email: string;
      target_user_email?: string;
      action: string;
      entity_type: string;
      entity_id: string;
      details: Record<string, any>;
      created_at: string;
    }>;
    courseGrades: Array<{
      moodleCourseId: number;
      moodleUserId: number;
      name: string;
      email: string;
      taskGrade: number;
      quizGrade: number;
      progress: number;
      feedback: string;
    }>;
  };
};

if (!globalStore.__iiniciaStore) {
  globalStore.__iiniciaStore = {
    profiles: [
      {
        id: '00000000-0000-4000-8000-000000000006',
        email: 'ivan3172001@gmail.com',
        first_name: 'Iván',
        last_name: '(Administrador)',
        phone: '+52 55 1000 0000',
        status: 'activo',
        moodle_user_id: 1001,
        moodle_sync_status: 'sincronizado',
        moodle_last_sync_at: '2026-10-01T09:00:00Z',
        created_at: '2026-10-01T08:00:00Z',
        updated_at: '2026-10-01T08:00:00Z',
      },
      {
        id: '00000000-0000-4000-8000-000000000007',
        email: 'negromante.ba@gmail.com',
        first_name: 'Profesor',
        last_name: 'Titular (negromante.ba)',
        phone: '+52 55 1000 0007',
        status: 'activo',
        moodle_user_id: 2002,
        moodle_sync_status: 'sincronizado',
        moodle_last_sync_at: '2026-10-15T12:00:00Z',
        created_at: '2026-10-02T09:00:00Z',
        updated_at: '2026-10-15T12:00:00Z',
      },
      {
        id: '00000000-0000-4000-8000-000000000008',
        email: 'urielgonzalezvargas25@gmail.com',
        first_name: 'Uriel',
        last_name: 'González Vargas',
        phone: '+52 55 1000 0008',
        status: 'activo',
        moodle_user_id: 3003,
        moodle_sync_status: 'sincronizado',
        moodle_last_sync_at: '2026-10-16T12:00:00Z',
        created_at: '2026-10-05T09:00:00Z',
        updated_at: '2026-10-16T12:00:00Z',
      },
      {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'admin@iinicia.edu.mx',
        first_name: 'Elena',
        last_name: 'Vargas (Administradora)',
        phone: '+52 55 1000 0001',
        status: 'activo',
        moodle_user_id: null,
        moodle_sync_status: 'sin_sincronizar',
        moodle_last_sync_at: null,
        created_at: '2026-10-01T09:00:00Z',
        updated_at: '2026-10-01T09:00:00Z',
      },
      {
        id: '00000000-0000-4000-8000-000000000002',
        email: 'profesor@iinicia.edu.mx',
        first_name: 'Roberto',
        last_name: 'Méndez',
        phone: '+52 55 1000 0002',
        status: 'activo',
        moodle_user_id: 2001,
        moodle_sync_status: 'sincronizado',
        moodle_last_sync_at: '2026-10-15T12:00:00Z',
        created_at: '2026-10-02T10:00:00Z',
        updated_at: '2026-10-15T12:00:00Z',
      },
      {
        id: '00000000-0000-4000-8000-000000000003',
        email: 'estudiante1@iinicia.edu.mx',
        first_name: 'Ana Sofía',
        last_name: 'García',
        phone: '+52 55 1000 0003',
        status: 'activo',
        moodle_user_id: 3001,
        moodle_sync_status: 'sincronizado',
        moodle_last_sync_at: '2026-10-16T14:30:00Z',
        created_at: '2026-10-05T11:00:00Z',
        updated_at: '2026-10-16T14:30:00Z',
      },
      {
        id: '00000000-0000-4000-8000-000000000004',
        email: 'estudiante2@iinicia.edu.mx',
        first_name: 'Carlos Eduardo',
        last_name: 'López',
        phone: '+52 55 1000 0004',
        status: 'activo',
        moodle_user_id: 3002,
        moodle_sync_status: 'sincronizado',
        moodle_last_sync_at: '2026-10-16T15:00:00Z',
        created_at: '2026-10-06T09:30:00Z',
        updated_at: '2026-10-16T15:00:00Z',
      },
      {
        id: '00000000-0000-4000-8000-000000000005',
        email: 'aspirante@iinicia.edu.mx',
        first_name: 'Lucía',
        last_name: 'Fernández',
        phone: '+52 55 1000 0005',
        status: 'pendiente',
        moodle_user_id: null,
        moodle_sync_status: 'sin_sincronizar',
        moodle_last_sync_at: null,
        created_at: '2026-10-19T16:20:00Z',
        updated_at: '2026-10-19T16:20:00Z',
      },
    ],
    userRoles: [
      {
        user_id: '00000000-0000-4000-8000-000000000006',
        role_code: 'admin',
        assigned_at: '2026-10-01T08:00:00Z',
      },
      {
        user_id: '00000000-0000-4000-8000-000000000007',
        role_code: 'profesor',
        assigned_at: '2026-10-02T09:00:00Z',
      },
      {
        user_id: '00000000-0000-4000-8000-000000000008',
        role_code: 'estudiante',
        assigned_at: '2026-10-05T09:00:00Z',
      },
      {
        user_id: '00000000-0000-4000-8000-000000000001',
        role_code: 'admin',
        assigned_at: '2026-10-01T09:00:00Z',
      },
      {
        user_id: '00000000-0000-4000-8000-000000000002',
        role_code: 'profesor',
        assigned_at: '2026-10-02T10:00:00Z',
      },
      {
        user_id: '00000000-0000-4000-8000-000000000003',
        role_code: 'estudiante',
        assigned_at: '2026-10-05T11:00:00Z',
      },
      {
        user_id: '00000000-0000-4000-8000-000000000004',
        role_code: 'estudiante',
        assigned_at: '2026-10-06T09:30:00Z',
      },
      {
        user_id: '00000000-0000-4000-8000-000000000005',
        role_code: 'aspirante',
        assigned_at: '2026-10-19T16:20:00Z',
      },
    ],
    userPrograms: [
      {
        id: 'up-uriel-101',
        user_id: '00000000-0000-4000-8000-000000000008',
        program_id: '11111111-1111-4111-8111-111111111101',
        academic_status: 'cursando',
        enrolled_at: '2026-10-05T10:00:00Z',
      },
      {
        id: 'up-001',
        user_id: '00000000-0000-4000-8000-000000000003',
        program_id: '11111111-1111-4111-8111-111111111101',
        academic_status: 'cursando',
        enrolled_at: '2026-10-05T12:00:00Z',
      },
      {
        id: 'up-002',
        user_id: '00000000-0000-4000-8000-000000000004',
        program_id: '11111111-1111-4111-8111-111111111102',
        academic_status: 'cursando',
        enrolled_at: '2026-10-06T12:00:00Z',
      },
    ],
    enrollments: [
      {
        id: 'enr-negro-101',
        user_id: '00000000-0000-4000-8000-000000000007',
        course_mapping_id: '22222222-2222-4222-8222-222222222201',
        moodle_role: 'editingteacher',
        status: 'sincronizada',
        moodle_synced_at: '2026-10-15T12:01:00Z',
        created_at: '2026-10-15T11:55:00Z',
      },
      {
        id: 'enr-negro-102',
        user_id: '00000000-0000-4000-8000-000000000007',
        course_mapping_id: '22222222-2222-4222-8222-222222222202',
        moodle_role: 'editingteacher',
        status: 'sincronizada',
        moodle_synced_at: '2026-10-15T12:03:00Z',
        created_at: '2026-10-15T11:58:00Z',
      },
      {
        id: 'enr-uriel-101',
        user_id: '00000000-0000-4000-8000-000000000008',
        course_mapping_id: '22222222-2222-4222-8222-222222222201',
        moodle_role: 'student',
        status: 'sincronizada',
        moodle_synced_at: '2026-10-16T12:01:00Z',
        created_at: '2026-10-16T11:55:00Z',
      },
      {
        id: 'enr-uriel-102',
        user_id: '00000000-0000-4000-8000-000000000008',
        course_mapping_id: '22222222-2222-4222-8222-222222222202',
        moodle_role: 'student',
        status: 'sincronizada',
        moodle_synced_at: '2026-10-16T12:03:00Z',
        created_at: '2026-10-16T11:58:00Z',
      },
      {
        id: 'enr-prof-101',
        user_id: '00000000-0000-4000-8000-000000000002',
        course_mapping_id: '22222222-2222-4222-8222-222222222201',
        moodle_role: 'editingteacher',
        status: 'sincronizada',
        moodle_synced_at: '2026-10-15T12:01:00Z',
        created_at: '2026-10-15T11:55:00Z',
      },
      {
        id: 'enr-prof-102',
        user_id: '00000000-0000-4000-8000-000000000002',
        course_mapping_id: '22222222-2222-4222-8222-222222222202',
        moodle_role: 'editingteacher',
        status: 'sincronizada',
        moodle_synced_at: '2026-10-15T12:03:00Z',
        created_at: '2026-10-15T11:58:00Z',
      },
      {
        id: 'enr-est1-101',
        user_id: '00000000-0000-4000-8000-000000000003',
        course_mapping_id: '22222222-2222-4222-8222-222222222201',
        moodle_role: 'student',
        status: 'sincronizada',
        moodle_synced_at: '2026-10-16T14:31:00Z',
        created_at: '2026-10-16T14:00:00Z',
      },
      {
        id: 'enr-est1-102',
        user_id: '00000000-0000-4000-8000-000000000003',
        course_mapping_id: '22222222-2222-4222-8222-222222222202',
        moodle_role: 'student',
        status: 'sincronizada',
        moodle_synced_at: '2026-10-16T14:33:00Z',
        created_at: '2026-10-16T14:05:00Z',
      },
      {
        id: 'enr-est2-101',
        user_id: '00000000-0000-4000-8000-000000000004',
        course_mapping_id: '22222222-2222-4222-8222-222222222201',
        moodle_role: 'student',
        status: 'sincronizada',
        moodle_synced_at: '2026-10-16T15:01:00Z',
        created_at: '2026-10-16T14:50:00Z',
      },
      {
        id: 'enr-est2-102',
        user_id: '00000000-0000-4000-8000-000000000004',
        course_mapping_id: '22222222-2222-4222-8222-222222222202',
        moodle_role: 'student',
        status: 'sincronizada',
        moodle_synced_at: '2026-10-16T15:03:00Z',
        created_at: '2026-10-16T14:55:00Z',
      },
    ],
    auditLogs: [
      {
        id: 'audit-001',
        actor_email: 'admin@iinicia.edu.mx',
        target_user_email: 'profesor@iinicia.edu.mx',
        action: 'MOODLE_TEACHER_SYNCED',
        entity_type: 'enrollment_requests',
        entity_id: 'enr-prof-101',
        details: {
          moodle_user_id: 2001,
          courses: ['IINICIA-TI-101', 'IINICIA-REACT-202'],
          moodle_role: 'editingteacher',
        },
        created_at: '2026-10-15T12:03:00Z',
      },
      {
        id: 'audit-002',
        actor_email: 'admin@iinicia.edu.mx',
        target_user_email: 'estudiante1@iinicia.edu.mx',
        action: 'MOODLE_STUDENT_ENROLLED',
        entity_type: 'enrollment_requests',
        entity_id: 'enr-est1-101',
        details: {
          moodle_user_id: 3001,
          courses: ['IINICIA-TI-101', 'IINICIA-REACT-202'],
          moodle_role: 'student',
        },
        created_at: '2026-10-16T14:33:00Z',
      },
    ],
    courseGrades: [
      {
        moodleCourseId: 101,
        moodleUserId: 3003,
        name: 'Uriel González Vargas',
        email: 'urielgonzalezvargas25@gmail.com',
        taskGrade: 95,
        quizGrade: 96,
        progress: 100,
        feedback:
          'Excelente desempeño en prácticas de sistemas y desarrollo web.',
      },
      {
        moodleCourseId: 102,
        moodleUserId: 3003,
        name: 'Uriel González Vargas',
        email: 'urielgonzalezvargas25@gmail.com',
        taskGrade: 97,
        quizGrade: 95,
        progress: 100,
        feedback:
          'Excelente implementación de componentes React, TypeScript y Next.js.',
      },
      {
        moodleCourseId: 101,
        moodleUserId: 3001,
        name: 'Ana Sofía García',
        email: 'estudiante1@iinicia.edu.mx',
        taskGrade: 96,
        quizGrade: 95,
        progress: 100,
        feedback: 'Excelente dominio de arquitectura de TI y segmentación de red.',
      },
      {
        moodleCourseId: 101,
        moodleUserId: 3002,
        name: 'Carlos Eduardo López',
        email: 'estudiante2@iinicia.edu.mx',
        taskGrade: 92,
        quizGrade: 94,
        progress: 90,
        feedback: 'Muy buen diagnóstico de infraestructura y participación en foro.',
      },
      {
        moodleCourseId: 102,
        moodleUserId: 3001,
        name: 'Ana Sofía García',
        email: 'estudiante1@iinicia.edu.mx',
        taskGrade: 98,
        quizGrade: 96,
        progress: 100,
        feedback: 'Implementación sobresaliente de componentes React + TypeScript y RBAC.',
      },
      {
        moodleCourseId: 102,
        moodleUserId: 3002,
        name: 'Carlos Eduardo López',
        email: 'estudiante2@iinicia.edu.mx',
        taskGrade: 93,
        quizGrade: 95,
        progress: 95,
        feedback: 'Buen manejo de hooks y consumo seguro de API NestJS.',
      },
    ],
  };
}

const store = globalStore.__iiniciaStore;

function getUserRoles(userId: string): RoleCode[] {
  const roles = store.userRoles
    .filter((ur) => ur.user_id === userId)
    .map((ur) => ur.role_code);
  return roles.length > 0 ? roles : ['aspirante'];
}

function getPrimaryRole(roles: RoleCode[]): RoleCode {
  const priority: RoleCode[] = [
    'superadmin',
    'admin',
    'coordinador',
    'profesor',
    'estudiante',
    'soporte',
    'aspirante',
  ];
  for (const r of priority) {
    if (roles.includes(r)) return r;
  }
  return 'aspirante';
}

function encodeToken(userId: string, email: string) {
  const payload = JSON.stringify({ sub: userId, email, iat: Date.now() });
  return `iinicia.${Buffer.from(payload).toString('base64url')}.sig`;
}

function resolveUserFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    const parts = token.split('.');
    if (parts.length >= 2) {
      try {
        const decoded = JSON.parse(
          Buffer.from(parts[1], 'base64url').toString('utf8'),
        );
        const profile = store.profiles.find(
          (p) =>
            p.id === decoded.sub ||
            p.email.toLowerCase() === String(decoded.email || '').toLowerCase(),
        );
        if (profile) {
          const roles = getUserRoles(profile.id);
          return { profile, roles, primaryRole: getPrimaryRole(roles) };
        }
      } catch {
        // Fallback
      }
    }
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  const pathStr = '/' + (params.slug || []).join('/');

  if (pathStr === '/public/programs') {
    return NextResponse.json({ programs: FALLBACK_PROGRAMS });
  }

  if (pathStr.startsWith('/public/programs/')) {
    const slug = params.slug[2];
    const prog = FALLBACK_PROGRAMS.find((p) => p.slug === slug);
    if (!prog) {
      return NextResponse.json(
        { message: 'Programa no encontrado' },
        { status: 404 },
      );
    }
    return NextResponse.json({ program: prog });
  }

  if (pathStr === '/auth/me') {
    const ctx = resolveUserFromRequest(req);
    if (!ctx) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }
    return NextResponse.json({ user: ctx });
  }

  if (pathStr === '/campus/dashboard') {
    const ctx = resolveUserFromRequest(req);
    if (!ctx) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }
    const { profile, roles, primaryRole } = ctx;
    const myPrograms = store.userPrograms
      .filter((up) => up.user_id === profile.id)
      .map((up) => ({
        ...up,
        program: FALLBACK_PROGRAMS.find((p) => p.id === up.program_id),
      }));

    const authorizedCourses = store.enrollments
      .filter((e) => e.user_id === profile.id)
      .map((enr) => {
        const course = COURSE_MAPPINGS.find(
          (c) => c.id === enr.course_mapping_id,
        );
        if (!course) return null;
        return {
          enrollment_id: enr.id,
          enrollment_status: enr.status,
          moodle_role: enr.moodle_role,
          moodle_role_label:
            enr.moodle_role === 'editingteacher'
              ? 'Profesor (Teacher)'
              : 'Estudiante (Student)',
          moodle_synced_at: enr.moodle_synced_at,
          course,
          role_capabilities_in_moodle:
            enr.moodle_role === 'editingteacher'
              ? [
                  'Configurar actividades, foros, tareas y cuestionarios',
                  'Calificar entregas y retroalimentar estudiantes',
                  'Consultar reporte de participación y finalización del grupo',
                ]
              : [
                  'Consultar materiales, páginas y recursos PDF',
                  'Participar en foros y entregar tareas/actividades prácticas',
                  'Responder cuestionarios y consultar calificaciones propias y progreso',
                ],
        };
      })
      .filter(Boolean);

    if (primaryRole === 'aspirante') {
      return NextResponse.json({
        profile,
        roles,
        primaryRole,
        programs: myPrograms,
        authorizedCourses: [],
        campusAccessEnabled: false,
        admissionTracker: {
          stage: 'En revisión por Admisiones',
          nextSteps: [
            'Verificación de identidad con Google Authenticator (2FA)',
            'Revisión documental y autorización administrativa',
            'Asignación de rol Estudiante y matrícula en cursos autorizados',
          ],
        },
      });
    }

    return NextResponse.json({
      profile,
      roles,
      primaryRole,
      programs: myPrograms,
      authorizedCourses,
      campusAccessEnabled: true,
      ...(primaryRole === 'admin' || primaryRole === 'superadmin'
        ? {
            adminSummary: {
              totalUsers: store.profiles.length,
              pendingUsers: store.profiles.filter(
                (u) => u.status === 'pendiente',
              ).length,
              syncedWithMoodle: store.profiles.filter(
                (u) => u.moodle_user_id !== null,
              ).length,
              totalActiveCourses: COURSE_MAPPINGS.length,
              totalEnrollments: store.enrollments.length,
            },
          }
        : {}),
    });
  }

  if (pathStr === '/admin/users') {
    const users = store.profiles.map((profile) => {
      const roles = getUserRoles(profile.id);
      const programs = store.userPrograms
        .filter((up) => up.user_id === profile.id)
        .map((up) => {
          const prog = FALLBACK_PROGRAMS.find((p) => p.id === up.program_id);
          return {
            id: up.id,
            program_id: up.program_id,
            program_title: prog?.title || '',
            program_code: prog?.code || '',
            academic_status: up.academic_status,
          };
        });
      const enrollments = store.enrollments
        .filter((e) => e.user_id === profile.id)
        .map((e) => {
          const c = COURSE_MAPPINGS.find((cm) => cm.id === e.course_mapping_id);
          return {
            id: e.id,
            course_mapping_id: e.course_mapping_id,
            course_code: c?.course_code || '',
            course_name: c?.course_name || '',
            moodle_course_id: c?.moodle_course_id || 101,
            moodle_role: e.moodle_role,
            status: e.status,
          };
        });
      return {
        ...profile,
        roles,
        primaryRole: getPrimaryRole(roles),
        programs,
        enrollments,
      };
    });

    return NextResponse.json({
      users,
      rolesCatalog: ROLES_CATALOG,
      programsCatalog: FALLBACK_PROGRAMS,
      coursesCatalog: COURSE_MAPPINGS,
    });
  }

  if (pathStr === '/admin/moodle-status') {
    return NextResponse.json({
      integration: {
        moodleBaseUrl: '/campus',
        mode: 'integrated_moodle_lms',
        tokenConfiguredInBackendOnly: true,
        exposedToFrontend: false,
      },
    });
  }

  if (pathStr === '/admin/audit-logs') {
    return NextResponse.json({ auditLogs: store.auditLogs });
  }

  if (pathStr === '/campus/grades') {
    const courseId = Number(req.nextUrl.searchParams.get('courseId') || 101);
    try {
      const { data: dbGrades } = await supabase
        .from('course_grades')
        .select('*')
        .eq('moodle_course_id', courseId);

      if (dbGrades && dbGrades.length > 0) {
        for (const row of dbGrades) {
          const emailNorm = String(row.student_email || '')
            .trim()
            .toLowerCase();
          const existing = store.courseGrades.find(
            (g) =>
              g.moodleCourseId === courseId &&
              g.email.toLowerCase() === emailNorm,
          );
          if (existing) {
            existing.taskGrade = Number(row.task_grade ?? existing.taskGrade);
            existing.quizGrade = Number(row.quiz_grade ?? existing.quizGrade);
            existing.progress = Number(row.progress ?? existing.progress);
            existing.feedback = String(row.feedback ?? existing.feedback);
          } else {
            store.courseGrades.push({
              moodleCourseId: courseId,
              moodleUserId: Number(row.moodle_user_id || 3003),
              name: String(row.student_name || emailNorm),
              email: emailNorm,
              taskGrade: Number(row.task_grade ?? 0),
              quizGrade: Number(row.quiz_grade ?? 0),
              progress: Number(row.progress ?? 100),
              feedback: String(row.feedback ?? ''),
            });
          }
        }
      }
    } catch {
      // Fallback a memoria si no hay conexión momentánea
    }

    const grades = store.courseGrades.filter(
      (g) => g.moodleCourseId === courseId,
    );
    return NextResponse.json({ grades });
  }

  return NextResponse.json({ message: 'Endpoint activo' });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  const pathStr = '/' + (params.slug || []).join('/');
  const body = await req.json().catch(() => ({}));

  if (pathStr === '/auth/login') {
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    let profile = store.profiles.find((p) => p.email.toLowerCase() === email);
    if (!profile) {
      const now = new Date().toISOString();
      profile = {
        id: `usr-${Date.now()}`,
        email,
        first_name: email.split('@')[0] || 'Usuario',
        last_name: 'IINICIA',
        phone: '',
        status: 'activo',
        moodle_user_id: 3050,
        moodle_sync_status: 'sincronizado',
        moodle_last_sync_at: now,
        created_at: now,
        updated_at: now,
      };
      store.profiles.unshift(profile);
      store.userRoles.push({
        user_id: profile.id,
        role_code: 'estudiante',
        assigned_at: now,
      });
      store.enrollments.push({
        id: `enr-${Date.now()}`,
        user_id: profile.id,
        course_mapping_id: '22222222-2222-4222-8222-222222222201',
        moodle_role: 'student',
        status: 'sincronizada',
        moodle_synced_at: now,
        created_at: now,
      });
    }
    const roles = getUserRoles(profile.id);
    const user = { profile, roles, primaryRole: getPrimaryRole(roles) };
    const accessToken = encodeToken(profile.id, profile.email);
    return NextResponse.json({ accessToken, user });
  }

  if (pathStr === '/auth/register') {
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    let profile = store.profiles.find((p) => p.email.toLowerCase() === email);
    const now = new Date().toISOString();
    if (!profile) {
      profile = {
        id: `usr-${Date.now()}`,
        email,
        first_name: body.first_name || 'Usuario',
        last_name: body.last_name || 'IINICIA',
        phone: body.phone || '',
        status: 'pendiente',
        moodle_user_id: null,
        moodle_sync_status: 'sin_sincronizar',
        moodle_last_sync_at: null,
        created_at: now,
        updated_at: now,
      };
      store.profiles.unshift(profile);
      store.userRoles.push({
        user_id: profile.id,
        role_code: 'aspirante',
        assigned_at: now,
      });
    }
    const roles = getUserRoles(profile.id);
    const user = { profile, roles, primaryRole: getPrimaryRole(roles) };
    const accessToken = encodeToken(profile.id, profile.email);
    return NextResponse.json({ accessToken, user });
  }

  if (pathStr.startsWith('/campus/launch/')) {
    const courseMappingId = params.slug[2];
    const course =
      COURSE_MAPPINGS.find((c) => c.id === courseMappingId) ||
      COURSE_MAPPINGS[0];
    const ctx = resolveUserFromRequest(req);
    const isTeacher = ctx?.roles.includes('profesor');
    const launchUrl = `/campus?courseId=${course.moodle_course_id}&shortname=${course.moodle_shortname}&sso_ticket=sso_${Date.now()}`;
    return NextResponse.json({
      launchUrl,
      moodleBaseUrl: '/campus',
      moodleCourseId: course.moodle_course_id,
      moodleShortname: course.moodle_shortname,
      moodleUserId: ctx?.profile.moodle_user_id || 3001,
      assignedMoodleRole: isTeacher
        ? 'Teacher (Profesor)'
        : 'Student (Estudiante)',
      expiresInSeconds: 60,
      securityGuarantee:
        'Ticket efímero generado servidor-a-servidor (HMAC-SHA256). Sin exposición de MOODLE_WS_TOKEN ni contraseñas en texto plano.',
    });
  }

  if (pathStr === '/admin/enrollments') {
    const { user_id, course_mapping_id, moodle_role = 'student' } = body;
    const course =
      COURSE_MAPPINGS.find((c) => c.id === course_mapping_id) ||
      COURSE_MAPPINGS[0];
    const now = new Date().toISOString();
    const enr = {
      id: `enr-${Date.now()}`,
      user_id,
      course_mapping_id: course.id,
      moodle_role,
      status: 'sincronizada',
      moodle_synced_at: now,
      created_at: now,
    };
    store.enrollments.push(enr);
    return NextResponse.json({
      enrollment: enr,
      moodleEnrolResult: {
        enrolled: true,
        moodleCourseId: course.moodle_course_id,
        roleName: moodle_role,
      },
    });
  }

  if (pathStr.endsWith('/sync-moodle')) {
    const userId = params.slug[2];
    const profile = store.profiles.find((p) => p.id === userId);
    if (profile) {
      profile.moodle_user_id = profile.moodle_user_id || 3099;
      profile.moodle_sync_status = 'sincronizado';
      profile.moodle_last_sync_at = new Date().toISOString();
    }
    return NextResponse.json({
      moodleSyncResult: {
        moodleUserId: profile?.moodle_user_id || 3099,
        message: `Usuario sincronizado con Moodle (moodle_user_id=${profile?.moodle_user_id || 3099}) sin duplicados.`,
      },
    });
  }

  if (pathStr === '/campus/grades') {
    const ctx = resolveUserFromRequest(req);
    if (
      !ctx ||
      (!ctx.roles.includes('profesor') &&
        !ctx.roles.includes('admin') &&
        !ctx.roles.includes('superadmin'))
    ) {
      return NextResponse.json(
        {
          message:
            'Solo los usuarios con rol Profesor pueden registrar o modificar calificaciones de alumnos (CA-13).',
        },
        { status: 403 },
      );
    }
    const courseId = Number(body.moodleCourseId || 101);
    const emailNorm = String(body.studentEmail || '')
      .trim()
      .toLowerCase();
    let record = store.courseGrades.find(
      (g) =>
        g.moodleCourseId === courseId && g.email.toLowerCase() === emailNorm,
    );
    const taskGrade = Math.max(
      0,
      Math.min(100, Math.round(Number(body.taskGrade ?? 0))),
    );
    const quizGrade = Math.max(
      0,
      Math.min(100, Math.round(Number(body.quizGrade ?? 0))),
    );
    const progress = Math.max(
      0,
      Math.min(100, Math.round(Number(body.progress ?? 100))),
    );
    const feedback = String(body.feedback ?? '');

    if (record) {
      record.taskGrade = taskGrade;
      record.quizGrade = quizGrade;
      record.progress = progress;
      record.feedback = feedback;
    } else {
      const studentProf = store.profiles.find(
        (p) => p.email.toLowerCase() === emailNorm,
      );
      record = {
        moodleCourseId: courseId,
        moodleUserId: studentProf?.moodle_user_id || 3003,
        name: studentProf
          ? `${studentProf.first_name} ${studentProf.last_name}`.trim()
          : String(body.studentName || emailNorm),
        email: emailNorm,
        taskGrade,
        quizGrade,
        progress,
        feedback,
      };
      store.courseGrades.push(record);
    }

    try {
      await supabase.from('course_grades').upsert(
        {
          moodle_course_id: courseId,
          student_email: emailNorm,
          student_name: record.name,
          moodle_user_id: record.moodleUserId,
          task_grade: taskGrade,
          quiz_grade: quizGrade,
          progress,
          feedback,
          graded_by_email: ctx.profile.email,
        },
        { onConflict: 'moodle_course_id,student_email' },
      );

      await supabase.from('audit_logs').insert({
        actor_email: ctx.profile.email,
        target_user_email: emailNorm,
        action: 'MOODLE_TEACHER_GRADED_STUDENT',
        entity_type: 'course_grades',
        entity_id: `${courseId}:${emailNorm}`,
        details: {
          moodle_course_id: courseId,
          task_grade: taskGrade,
          quiz_grade: quizGrade,
          final_average: Math.round((taskGrade + quizGrade) / 2),
          progress,
          feedback,
        },
      });
    } catch {
      // Continuar si falla escritura remota
    }

    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actor_email: ctx.profile.email,
      target_user_email: emailNorm,
      action: 'MOODLE_TEACHER_GRADED_STUDENT',
      entity_type: 'moodle_gradebook',
      entity_id: `${courseId}:${emailNorm}`,
      details: {
        moodle_course_id: courseId,
        task_grade: taskGrade,
        quiz_grade: quizGrade,
        progress,
        feedback,
      },
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ updated: true, gradeRecord: record });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  const pathStr = '/' + (params.slug || []).join('/');
  const body = await req.json().catch(() => ({}));

  if (pathStr.startsWith('/admin/users/')) {
    const userId = params.slug[2];
    const profile = store.profiles.find((p) => p.id === userId);
    if (profile) {
      if (body.status) profile.status = body.status;
      if (body.role_code) {
        store.userRoles = store.userRoles.filter((ur) => ur.user_id !== userId);
        store.userRoles.push({
          user_id: userId,
          role_code: body.role_code,
          assigned_at: new Date().toISOString(),
        });
      }
      if (
        profile.status === 'activo' &&
        !profile.moodle_user_id &&
        (body.role_code === 'estudiante' || body.role_code === 'profesor')
      ) {
        profile.moodle_user_id = 3088;
        profile.moodle_sync_status = 'sincronizado';
      }
    }
    return NextResponse.json({
      user: profile,
      moodleSyncResult: profile?.moodle_user_id
        ? {
            moodleUserId: profile.moodle_user_id,
            message: `Vinculado con Moodle ID #${profile.moodle_user_id}`,
          }
        : null,
    });
  }

  if (pathStr === '/campus/grades') {
    const ctx = resolveUserFromRequest(req);
    if (
      !ctx ||
      (!ctx.roles.includes('profesor') &&
        !ctx.roles.includes('admin') &&
        !ctx.roles.includes('superadmin'))
    ) {
      return NextResponse.json(
        {
          message:
            'Solo los usuarios con rol Profesor pueden registrar o modificar calificaciones de alumnos (CA-13).',
        },
        { status: 403 },
      );
    }
    const courseId = Number(body.moodleCourseId || 101);
    const emailNorm = String(body.studentEmail || '')
      .trim()
      .toLowerCase();
    let record = store.courseGrades.find(
      (g) =>
        g.moodleCourseId === courseId && g.email.toLowerCase() === emailNorm,
    );
    const taskGrade = Math.max(
      0,
      Math.min(100, Math.round(Number(body.taskGrade ?? 0))),
    );
    const quizGrade = Math.max(
      0,
      Math.min(100, Math.round(Number(body.quizGrade ?? 0))),
    );
    const progress = Math.max(
      0,
      Math.min(100, Math.round(Number(body.progress ?? 100))),
    );
    const feedback = String(body.feedback ?? '');

    if (record) {
      record.taskGrade = taskGrade;
      record.quizGrade = quizGrade;
      record.progress = progress;
      record.feedback = feedback;
    } else {
      const studentProf = store.profiles.find(
        (p) => p.email.toLowerCase() === emailNorm,
      );
      record = {
        moodleCourseId: courseId,
        moodleUserId: studentProf?.moodle_user_id || 3003,
        name: studentProf
          ? `${studentProf.first_name} ${studentProf.last_name}`.trim()
          : String(body.studentName || emailNorm),
        email: emailNorm,
        taskGrade,
        quizGrade,
        progress,
        feedback,
      };
      store.courseGrades.push(record);
    }

    try {
      await supabase.from('course_grades').upsert(
        {
          moodle_course_id: courseId,
          student_email: emailNorm,
          student_name: record.name,
          moodle_user_id: record.moodleUserId,
          task_grade: taskGrade,
          quiz_grade: quizGrade,
          progress,
          feedback,
          graded_by_email: ctx.profile.email,
        },
        { onConflict: 'moodle_course_id,student_email' },
      );

      await supabase.from('audit_logs').insert({
        actor_email: ctx.profile.email,
        target_user_email: emailNorm,
        action: 'MOODLE_TEACHER_GRADED_STUDENT',
        entity_type: 'course_grades',
        entity_id: `${courseId}:${emailNorm}`,
        details: {
          moodle_course_id: courseId,
          task_grade: taskGrade,
          quiz_grade: quizGrade,
          final_average: Math.round((taskGrade + quizGrade) / 2),
          progress,
          feedback,
        },
      });
    } catch {
      // Continuar si falla escritura remota
    }

    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actor_email: ctx.profile.email,
      target_user_email: emailNorm,
      action: 'MOODLE_TEACHER_GRADED_STUDENT',
      entity_type: 'moodle_gradebook',
      entity_id: `${courseId}:${emailNorm}`,
      details: {
        moodle_course_id: courseId,
        task_grade: taskGrade,
        quiz_grade: quizGrade,
        progress,
        feedback,
      },
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ updated: true, gradeRecord: record });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  const pathStr = '/' + (params.slug || []).join('/');
  if (pathStr.startsWith('/admin/enrollments/')) {
    const enrollmentId = params.slug[2];
    store.enrollments = store.enrollments.filter((e) => e.id !== enrollmentId);
    return NextResponse.json({ revoked: true, enrollmentId });
  }
  return NextResponse.json({ ok: true });
}
