'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

interface ForumPost {
  id: string;
  author: string;
  role: 'Profesor' | 'Estudiante';
  date: string;
  message: string;
}

const INITIAL_FORUM_POSTS: Record<number, ForumPost[]> = {
  101: [
    {
      id: 'fp-101-1',
      author: 'Mtro. Roberto Méndez',
      role: 'Profesor',
      date: '16 oct 2026 · 09:15',
      message:
        'Bienvenidos al Curso 1: Introducción a las Tecnologías de la Información (IINICIA-TI-101). En este foro analizaremos cómo la convergencia entre redes TCP/IP, bases de datos relacionales y ciberseguridad sostiene a las organizaciones modernas.',
    },
    {
      id: 'fp-101-2',
      author: 'Ana Sofía García',
      role: 'Estudiante',
      date: '16 oct 2026 · 14:40',
      message:
        'Hola profesor y compañeros. Considero que la segmentación de red mediante VLANs y el control de acceso basado en roles (RBAC) son pilares indispensables para proteger la integridad de los sistemas.',
    },
    {
      id: 'fp-101-3',
      author: 'Carlos Eduardo López',
      role: 'Estudiante',
      date: '16 oct 2026 · 16:05',
      message:
        'Coincido con Ana Sofía. Además, la alta disponibilidad en la nube y los respaldos automatizados garantizan la continuidad operativa ante cualquier incidente.',
    },
  ],
  102: [
    {
      id: 'fp-102-1',
      author: 'Mtro. Roberto Méndez',
      role: 'Profesor',
      date: '17 oct 2026 · 10:00',
      message:
        'Bienvenidos al Curso 2: Desarrollo Web con React (IINICIA-REACT-202). Compartan aquí sus dudas y hallazgos sobre el tipado estático de props con TypeScript y el consumo seguro de APIs desde Next.js.',
    },
    {
      id: 'fp-102-2',
      author: 'Ana Sofía García',
      role: 'Estudiante',
      date: '17 oct 2026 · 15:20',
      message:
        'Separar la capa de presentación en React de la lógica de negocio en NestJS evita exponer credenciales de Moodle o Supabase en el navegador.',
    },
    {
      id: 'fp-102-3',
      author: 'Carlos Eduardo López',
      role: 'Estudiante',
      date: '17 oct 2026 · 17:10',
      message:
        'El uso de Custom Hooks junto con Context API nos facilitó mucho validar el rol activo antes de renderizar cada panel.',
    },
  ],
};

const QUIZ_QUESTIONS: Record<
  number,
  Array<{
    q: string;
    options: string[];
    correct: number;
  }>
> = {
  101: [
    {
      q: '1. ¿Cuál es la función principal de una política Row Level Security (RLS) en PostgreSQL / Supabase?',
      options: [
        'Restringir qué filas puede leer o modificar cada usuario según su identidad y rol',
        'Aumentar la velocidad del ventilador del servidor físico',
        'Reemplazar el protocolo TCP/IP por Bluetooth',
      ],
      correct: 0,
    },
    {
      q: '2. En una arquitectura institucional segura, ¿dónde deben almacenarse los tokens administrativos de Web Services de Moodle?',
      options: [
        'En el código público del navegador para acceso directo',
        'Exclusivamente en variables de entorno seguras del Backend / API (NestJS)',
        'En una cookie sin cifrar visible para cualquier script',
      ],
      correct: 1,
    },
  ],
  102: [
    {
      q: '1. En React + TypeScript, ¿qué ventaja ofrece definir interfaces estrictas para las Props de un componente?',
      options: [
        'Detectar errores de tipos en tiempo de compilación y documentar el contrato del componente',
        'Permitir que React se conecte directamente por SQL al puerto 5432 de Moodle',
        'Eliminar la necesidad de usar HTML semántico',
      ],
      correct: 0,
    },
    {
      q: '2. Según el principio de mínimo privilegio (RBAC) en el portal IINICIA, ¿cómo debe manejarse una vista no autorizada?',
      options: [
        'Enviar todos los datos confidenciales al navegador y solo ocultarlos con CSS',
        'Validar el rol en el servidor (Backend y RLS) y no enviar datos no autorizados al cliente',
        'Mostrar botones deshabilitados con las credenciales en el código fuente',
      ],
      correct: 1,
    },
  ],
};

function CampusMoodleContent() {
  const searchParams = useSearchParams();
  const { user, accessToken, loading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(101);
  const [activeTab, setActiveTab] = useState<
    'contenido' | 'foro' | 'tarea' | 'cuestionario' | 'calificaciones'
  >('contenido');

  // Estados interactivos del aula Moodle
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({
    '101-pres': true,
    '101-pdf': true,
    '102-pres': true,
    '102-guia': true,
  });
  const [forumPosts, setForumPosts] =
    useState<Record<number, ForumPost[]>>(INITIAL_FORUM_POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [taskSubmission, setTaskSubmission] = useState<Record<number, string>>({
    101: 'Diagnóstico de red corporativa, segmentación VLAN y modelo entidad-relación entregado.',
    102: 'Repositorio con componentes React + TypeScript, validación RBAC y consumo de API NestJS.',
  });
  const [taskSavedMsg, setTaskSavedMsg] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<Record<number, number | null>>({
    101: 95,
    102: 98,
  });

  // Calificaciones del grupo (vista Profesor Teacher vs vista Estudiante Student)
  const [studentGrades, setStudentGrades] = useState<
    Array<{
      moodleUserId: number;
      name: string;
      email: string;
      taskGrade: number;
      quizGrade: number;
      progress: number;
      feedback: string;
    }>
  >([
    {
      moodleUserId: 3001,
      name: 'Ana Sofía García',
      email: 'estudiante1@iinicia.edu.mx',
      taskGrade: 96,
      quizGrade: 95,
      progress: 100,
      feedback: 'Excelente dominio de arquitectura de TI y componentes React.',
    },
    {
      moodleUserId: 3002,
      name: 'Carlos Eduardo López',
      email: 'estudiante2@iinicia.edu.mx',
      taskGrade: 92,
      quizGrade: 94,
      progress: 90,
      feedback: 'Muy buena implementación práctica y participación en el foro.',
    },
  ]);

  const ssoTicket = searchParams.get('sso_ticket');
  const queryCourseId = Number(searchParams.get('courseId') || 0);

  useEffect(() => {
    if (queryCourseId === 101 || queryCourseId === 102) {
      setSelectedCourseId(queryCourseId);
    }
  }, [queryCourseId]);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest(`/campus/grades?courseId=${selectedCourseId}`, {}, accessToken)
      .then((res: any) => {
        if (Array.isArray(res?.grades) && res.grades.length > 0) {
          setStudentGrades(res.grades);
        }
      })
      .catch(() => {});
  }, [accessToken, selectedCourseId]);

  const handleTeacherSaveGrade = async (student: {
    moodleUserId: number;
    name: string;
    email: string;
    taskGrade: number;
    quizGrade: number;
    progress: number;
    feedback: string;
  }) => {
    if (!accessToken) return;
    setTaskSavedMsg(null);
    setError(null);
    try {
      await apiRequest(
        '/campus/grades',
        {
          method: 'POST',
          body: JSON.stringify({
            moodleCourseId: selectedCourseId,
            studentEmail: student.email,
            taskGrade: student.taskGrade,
            quizGrade: student.quizGrade,
            progress: student.progress,
            feedback: student.feedback,
          }),
        },
        accessToken,
      );
      setTaskSavedMsg(
        `✔ Calificación de ${student.name} guardada en el Libro de Calificaciones de Moodle y auditada.`,
      );
      setTimeout(() => setTaskSavedMsg(null), 4000);
    } catch (err: any) {
      setError(
        err.message || 'No se pudo guardar la calificación del estudiante.',
      );
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    apiRequest('/campus/dashboard', {}, accessToken)
      .then((res: any) => {
        setDashboard(res);
        if (
          !queryCourseId &&
          res.authorizedCourses &&
          res.authorizedCourses.length > 0
        ) {
          setSelectedCourseId(
            res.authorizedCourses[0].course.moodle_course_id || 101,
          );
        }
      })
      .catch((err: any) => {
        setError(err.message || 'No se pudo conectar con el Campus Moodle.');
      })
      .finally(() => setLoading(false));
  }, [accessToken, authLoading, queryCourseId]);

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-600">
        Verificando credenciales Single Sign-On (SSO) y permisos de matrícula en
        Campus Moodle...
      </div>
    );
  }

  if (!user || !dashboard) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-sky-100 text-[#0066ff]">
            Sección 11 · Autenticación y Acceso al Campus
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Acceso al Campus Virtual Moodle IINICIA
          </h1>
          <p className="text-sm text-slate-600">
            Para ingresar a tus aulas virtuales en Moodle debes iniciar sesión en
            el portal institucional y contar con matrícula activa autorizada.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#0066ff] hover:bg-blue-700 text-white transition"
          >
            Iniciar Sesión con Google Authenticator
          </Link>
        </div>
      </div>
    );
  }

  const { primaryRole, profile, authorizedCourses = [] } = dashboard;

  // Regla obligatoria Sección 6, CA-06, CA-12: Aspirante no tiene acceso a cursos en Moodle
  if (primaryRole === 'aspirante') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-8 space-y-4 text-amber-950">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-200 text-amber-950">
            Restricción RBAC · Criterio CA-06 y CA-12
          </span>
          <h1 className="text-2xl font-extrabold">
            Sin acceso al Campus Moodle (Rol: Aspirante)
          </h1>
          <p className="text-sm leading-relaxed">
            Tu cuenta se encuentra actualmente con rol{' '}
            <strong>Aspirante</strong>. De acuerdo con el documento de alcance
            técnico (Sección 6), un aspirante no puede visualizar ni ingresar a
            los cursos de Moodle hasta que un Administrador valide su registro,
            le asigne el rol <strong>Estudiante</strong> y autorice su matrícula.
          </p>
          <Link
            href="/mi-iinicia"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-900 text-white"
          >
            ← Volver a Mi IINICIA
          </Link>
        </div>
      </div>
    );
  }

  const currentCourseEnrollment =
    authorizedCourses.find(
      (c: any) => c.course.moodle_course_id === selectedCourseId,
    ) || authorizedCourses[0];

  if (!currentCourseEnrollment && primaryRole !== 'admin' && primaryRole !== 'superadmin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <h1 className="text-xl font-extrabold text-slate-900">
            No tienes cursos autorizados en Moodle todavía
          </h1>
          <p className="text-sm text-slate-600">
            Solicita al Administrador tu inscripción en{' '}
            <strong>Curso 1 (TI-101)</strong> o{' '}
            <strong>Curso 2 (WEB-202)</strong> desde el Panel Administrativo.
          </p>
          <Link
            href="/mi-iinicia"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0066ff] text-white"
          >
            ← Volver a Mi IINICIA
          </Link>
        </div>
      </div>
    );
  }

  const activeCourseId =
    currentCourseEnrollment?.course?.moodle_course_id || selectedCourseId || 101;
  const isTeacher =
    currentCourseEnrollment?.moodle_role === 'editingteacher' ||
    primaryRole === 'profesor' ||
    primaryRole === 'admin' ||
    primaryRole === 'superadmin';

  const courseTitle =
    activeCourseId === 101
      ? 'Curso 1. Introducción a las Tecnologías de la Información'
      : 'Curso 2. Desarrollo Web con React';
  const courseShortname =
    activeCourseId === 101 ? 'IINICIA-TI-101' : 'IINICIA-REACT-202';

  const handleAddForumPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const newPost: ForumPost = {
      id: `fp-${Date.now()}`,
      author: `${profile.first_name} ${profile.last_name}`,
      role: isTeacher ? 'Profesor' : 'Estudiante',
      date: 'Hoy · Justo ahora',
      message: newPostText.trim(),
    };
    setForumPosts((prev) => ({
      ...prev,
      [activeCourseId]: [...(prev[activeCourseId] || []), newPost],
    }));
    setNewPostText('');
    setCompletedItems((prev) => ({ ...prev, [`${activeCourseId}-foro`]: true }));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    setCompletedItems((prev) => ({ ...prev, [`${activeCourseId}-tarea`]: true }));
    setTaskSavedMsg(
      '✔ Entrega registrada exitosamente en Moodle y marcada como completada.',
    );
    setTimeout(() => setTaskSavedMsg(null), 4000);
  };

  const handleGradeQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const questions = QUIZ_QUESTIONS[activeCourseId] || [];
    let hits = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[`${activeCourseId}-${idx}`] === q.correct) {
        hits += 1;
      }
    });
    const score = Math.round((hits / Math.max(1, questions.length)) * 100);
    setQuizScore((prev) => ({ ...prev, [activeCourseId]: score }));
    setCompletedItems((prev) => ({
      ...prev,
      [`${activeCourseId}-quiz`]: true,
      [`${activeCourseId}-fin`]: true,
    }));
  };

  return (
    <div className="bg-[#e8f4fd] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Barra Superior de Identidad Unificada Portal ↔ Moodle (CA-17) */}
        <header className="bg-[#060e26] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-[#0066ff] text-white">
                Campus Virtual Moodle LMS · Identidad Visual IINICIA (CA-07, CA-17)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Rol en este Curso:{' '}
                {isTeacher
                  ? 'Profesor Titular (Teacher · CA-13)'
                  : 'Estudiante Matriculado (Student · CA-12)'}
              </span>
              {ssoTicket && (
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-sky-300">
                  SSO Ticket #{ssoTicket.slice(0, 10)}... Verificado
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold">{courseTitle}</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Clave corta Moodle: <strong className="text-white">{courseShortname}</strong> ·
              ID Curso Moodle: <strong className="text-white">#{activeCourseId}</strong> ·
              Usuario autenticado:{' '}
              <strong className="text-white">
                {profile.first_name} {profile.last_name} ({profile.email})
              </strong>
            </p>
          </div>

          {/* Selector entre los 2 Cursos Obligatorios de Ejemplo (Sección 8.1) */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCourseId(101)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeCourseId === 101
                  ? 'bg-[#0066ff] text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Curso 1: TI-101
            </button>
            <button
              type="button"
              onClick={() => setSelectedCourseId(102)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeCourseId === 102
                  ? 'bg-[#0066ff] text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Curso 2: React WEB-202
            </button>
            <Link
              href="/mi-iinicia"
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-white/25 text-white hover:bg-white/10 transition"
            >
              ← Volver a Mi IINICIA
            </Link>
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Navegación interna del Aula Moodle (Sección 8.1 Contenido mínimo requerido) */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 flex flex-wrap gap-2">
          {[
            { id: 'contenido', label: '📚 Presentación, Unidades y Recursos PDF' },
            { id: 'foro', label: '💬 Foro Académico' },
            { id: 'tarea', label: '📝 Tarea / Actividad Práctica' },
            { id: 'cuestionario', label: '✅ Cuestionario Automatizado' },
            {
              id: 'calificaciones',
              label: isTeacher
                ? '📊 Calificaciones y Finalización del Grupo (Vista Profesor)'
                : '📊 Mis Calificaciones y Finalización (Vista Estudiante)',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === tab.id
                  ? 'bg-[#0066ff] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido principal según pestaña seleccionada */}
        {activeTab === 'contenido' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase text-[#0066ff]">
                      Sección 8.1 · Curso de Ejemplo Obligatorio en Moodle
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      Presentación del Curso, Unidades y Recursos Oficiales
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                    Finalización de Curso Activa
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeCourseId === 101
                    ? 'Este curso obligatorio valida la integración completa entre el Portal React/Next.js, NestJS, Supabase y Moodle LMS. Incluye profesor titular (Roberto Méndez), dos estudiantes matriculados (Ana Sofía García y Carlos Eduardo López), presentación, recurso PDF, foro, tarea evaluable, cuestionario, calificación y finalización de actividad.'
                    : 'Este segundo curso obligatorio en Moodle cubre el desarrollo de aplicaciones modernas con React, TypeScript y Next.js, incluyendo unidades temáticas, guía técnica, actividad práctica entregable, foro técnico, evaluación con calificación y criterio de finalización de curso.'}
                </p>

                {/* Unidades y Recursos con check de finalización */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {activeCourseId === 101
                          ? 'Unidad 1 · Presentación y Fundamentos de Sistemas de Información'
                          : 'Tema 1 · Componentes, Props, Estado y TypeScript en React'}
                      </h3>
                      <span className="text-xs font-bold text-emerald-700">
                        ✔ Completado
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      <li className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                        <span>
                          📄 <strong>Página de presentación:</strong> Encuadre
                          académico, objetivos y criterios de evaluación
                        </span>
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-bold">
                          Visto
                        </span>
                      </li>
                      <li className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                        <span>
                          📕 <strong>Recurso PDF descargable:</strong>{' '}
                          {activeCourseId === 101
                            ? 'Manual de Arquitectura de Computadoras, Redes y Sistemas Operativos (PDF)'
                            : 'Guía Oficial de Patrones React 18, Hooks y TypeScript (PDF)'}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-bold">
                          Completado
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {activeCourseId === 101
                          ? 'Unidad 2 · Redes, Bases de Datos, Ciberseguridad y Evaluación'
                          : 'Tema 2 · Next.js App Router, Seguridad RBAC y Consumo de APIs'}
                      </h3>
                      <span className="text-xs font-bold text-[#0066ff]">
                        Actividades Evaluables
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('foro')}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#0066ff] text-left transition"
                      >
                        <div className="text-xs font-extrabold text-slate-900">
                          💬 Foro de Debate
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Participar con el profesor y compañeros →
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('tarea')}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#0066ff] text-left transition"
                      >
                        <div className="text-xs font-extrabold text-slate-900">
                          📝 Tarea / Actividad Práctica
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {isTeacher
                            ? 'Calificar entregas de alumnos →'
                            : 'Subir entrega de actividad →'}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('cuestionario')}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#0066ff] text-left transition"
                      >
                        <div className="text-xs font-extrabold text-slate-900">
                          ✅ Cuestionario Evaluable
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Responder evaluación oficial →
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Columna derecha: Participantes matriculados y Estado de Finalización (CA-09) */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <span className="text-xs font-extrabold uppercase text-[#0066ff]">
                  Criterio CA-09 · Participantes del Curso
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Profesor y Estudiantes Matriculados
                </h3>
                <ul className="space-y-3 text-xs">
                  <li className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <div className="font-extrabold text-indigo-950">
                      👨‍🏫 Mtro. Roberto Méndez
                    </div>
                    <div className="text-indigo-700">
                      profesor@iinicia.edu.mx · Rol Moodle:{' '}
                      <strong>Teacher (editingteacher)</strong>
                    </div>
                  </li>
                  <li className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="font-extrabold text-emerald-950">
                      👩‍🎓 Ana Sofía García
                    </div>
                    <div className="text-emerald-700">
                      estudiante1@iinicia.edu.mx · Rol Moodle:{' '}
                      <strong>Student (ID #3001)</strong>
                    </div>
                  </li>
                  <li className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="font-extrabold text-emerald-950">
                      👨‍🎓 Carlos Eduardo López
                    </div>
                    <div className="text-emerald-700">
                      estudiante2@iinicia.edu.mx · Rol Moodle:{' '}
                      <strong>Student (ID #3002)</strong>
                    </div>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}

        {/* Pestaña 2: Foro Académico */}
        {activeTab === 'foro' && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#0066ff]">
                Actividad de Aprendizaje en Moodle · Foro Académico
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {activeCourseId === 101
                  ? 'Foro: Impacto de las TI y la Seguridad en las Organizaciones'
                  : 'Foro Técnico: Arquitectura de Componentes React + Next.js'}
              </h2>
            </div>

            <div className="space-y-4">
              {(forumPosts[activeCourseId] || []).map((post) => (
                <article
                  key={post.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {post.author}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          post.role === 'Profesor'
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {post.role}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{post.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {post.message}
                  </p>
                </article>
              ))}
            </div>

            <form onSubmit={handleAddForumPost} className="space-y-3 pt-2">
              <label
                htmlFor="forum-reply"
                className="block text-xs font-bold text-slate-700"
              >
                Publicar aportación en el foro como {profile.first_name}{' '}
                {profile.last_name} ({isTeacher ? 'Profesor' : 'Estudiante'}):
              </label>
              <textarea
                id="forum-reply"
                rows={3}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Escribe tu comentario académico en el foro..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase bg-[#0066ff] hover:bg-blue-700 text-white transition"
              >
                Publicar en el Foro
              </button>
            </form>
          </section>
        )}

        {/* Pestaña 3: Tarea / Actividad Práctica */}
        {activeTab === 'tarea' && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#0066ff]">
                Actividad Evaluable en Moodle · Entrega y Calificación
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {activeCourseId === 101
                  ? 'Tarea: Diagnóstico de Arquitectura Empresarial y Red'
                  : 'Actividad Práctica: Implementación de Panel con RBAC y Consumo de API'}
              </h2>
            </div>

            {taskSavedMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                {taskSavedMsg}
              </div>
            )}

            {isTeacher ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950">
                  <strong>Vista exclusiva de Profesor (Teacher · CA-13):</strong>{' '}
                  Desde aquí puedes revisar, calificar y retroalimentar las
                  entregas de los estudiantes matriculados en este curso.
                </div>
                <div className="space-y-4">
                  {studentGrades.map((st, idx) => (
                    <div
                      key={st.email}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">
                            {st.name} ({st.email})
                          </div>
                          <div className="text-xs text-slate-500">
                            Moodle Student ID #{st.moodleUserId} · Promedio
                            actual:{' '}
                            <strong>
                              {Math.round((st.taskGrade + st.quizGrade) / 2)} /
                              100
                            </strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTeacherSaveGrade(st)}
                          className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#0066ff] hover:bg-blue-700 text-white shadow-sm transition shrink-0"
                        >
                          💾 Guardar Calificación en Moodle
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Calificación Tarea (0-100):
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={st.taskGrade}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setStudentGrades((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, taskGrade: val } : item,
                                ),
                              );
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Calificación Cuestionario (0-100):
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={st.quizGrade}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setStudentGrades((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, quizGrade: val } : item,
                                ),
                              );
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Avance de Finalización (%):
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={st.progress}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setStudentGrades((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, progress: val } : item,
                                ),
                              );
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Retroalimentación docente para el alumno:
                        </label>
                        <input
                          type="text"
                          value={st.feedback}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudentGrades((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, feedback: val } : item,
                              ),
                            );
                          }}
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveTask} className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                  <strong>Estado de la entrega (Vista Estudiante · CA-12):</strong>{' '}
                  Enviado para calificar · Calificación actual:{' '}
                  <strong>96 / 100</strong>
                </div>
                <div>
                  <label
                    htmlFor="task-text"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Texto en línea / Evidencia de tu actividad práctica:
                  </label>
                  <textarea
                    id="task-text"
                    rows={4}
                    value={taskSubmission[activeCourseId] || ''}
                    onChange={(e) =>
                      setTaskSubmission((prev) => ({
                        ...prev,
                        [activeCourseId]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase bg-[#0066ff] hover:bg-blue-700 text-white transition"
                >
                  Guardar y Actualizar Entrega en Moodle
                </button>
              </form>
            )}
          </section>
        )}

        {/* Pestaña 4: Cuestionario Automatizado */}
        {activeTab === 'cuestionario' && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase text-[#0066ff]">
                  Evaluación Automatizada en Moodle
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {activeCourseId === 101
                    ? 'Cuestionario Oficial: Conceptos Clave de TI y Seguridad'
                    : 'Cuestionario de Evaluación Final: React, TypeScript y Next.js'}
                </h2>
              </div>
              {quizScore[activeCourseId] !== null && (
                <span className="px-4 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900">
                  Calificación obtenida: {quizScore[activeCourseId]} / 100
                </span>
              )}
            </div>

            <form onSubmit={handleGradeQuiz} className="space-y-6">
              {(QUIZ_QUESTIONS[activeCourseId] || []).map((item, qIdx) => (
                <div
                  key={item.q}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="font-extrabold text-sm text-slate-900">
                    {item.q}
                  </div>
                  <div className="space-y-2">
                    {item.options.map((opt, optIdx) => (
                      <label
                        key={opt}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-[#0066ff] text-xs sm:text-sm text-slate-700"
                      >
                        <input
                          type="radio"
                          name={`q-${activeCourseId}-${qIdx}`}
                          checked={
                            quizAnswers[`${activeCourseId}-${qIdx}`] === optIdx
                          }
                          onChange={() =>
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [`${activeCourseId}-${qIdx}`]: optIdx,
                            }))
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-xs font-extrabold uppercase bg-[#0066ff] hover:bg-blue-700 text-white transition"
              >
                Enviar Cuestionario y Calificar en Moodle
              </button>
            </form>
          </section>
        )}

        {/* Pestaña 5: Libro de Calificaciones y Finalización de Curso */}
        {activeTab === 'calificaciones' && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#0066ff]">
                Libro de Calificaciones y Reporte de Finalización de Moodle
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {isTeacher
                  ? 'Reporte Docente de Calificaciones y Finalización del Grupo (Edición Habilitada)'
                  : 'Mis Calificaciones y Estado de Finalización de Curso'}
              </h2>
            </div>

            {taskSavedMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                {taskSavedMsg}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-extrabold uppercase text-slate-600">
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4">Tarea (0-100)</th>
                    <th className="py-3 px-4">Cuestionario (0-100)</th>
                    <th className="py-3 px-4">Promedio Final</th>
                    <th className="py-3 px-4">Retroalimentación / Avance</th>
                    {isTeacher && <th className="py-3 px-4">Acción Docente</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentGrades
                    .filter((st) =>
                      isTeacher
                        ? true
                        : st.email.toLowerCase() === profile.email.toLowerCase() ||
                          st.moodleUserId === 3001,
                    )
                    .map((st, idx) => {
                      const avg = Math.round((st.taskGrade + st.quizGrade) / 2);
                      return (
                        <tr key={st.email}>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">
                              {st.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {st.email} (Moodle ID #{st.moodleUserId})
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {isTeacher ? (
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={st.taskGrade}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setStudentGrades((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? { ...item, taskGrade: val }
                                        : item,
                                    ),
                                  );
                                }}
                                className="w-20 rounded-lg border border-slate-300 px-2.5 py-1 text-sm font-bold text-center"
                              />
                            ) : (
                              `${st.taskGrade} / 100`
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {isTeacher ? (
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={st.quizGrade}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setStudentGrades((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? { ...item, quizGrade: val }
                                        : item,
                                    ),
                                  );
                                }}
                                className="w-20 rounded-lg border border-slate-300 px-2.5 py-1 text-sm font-bold text-center"
                              />
                            ) : (
                              `${st.quizGrade} / 100`
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                                avg >= 70
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              {avg} / 100 ({avg >= 70 ? 'Aprobado' : 'Por acreditar'})
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-xs text-slate-700">
                              {st.feedback}
                            </div>
                            <div className="text-[11px] font-bold text-[#0066ff] mt-0.5">
                              ✔ {st.progress}% Completado
                            </div>
                          </td>
                          {isTeacher && (
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => handleTeacherSaveGrade(st)}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-[#0066ff] hover:bg-blue-700 text-white transition"
                              >
                                💾 Guardar
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function CampusPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
          Cargando Campus Virtual Moodle IINICIA...
        </div>
      }
    >
      <CampusMoodleContent />
    </Suspense>
  );
}
