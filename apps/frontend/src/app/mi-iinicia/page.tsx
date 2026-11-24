'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

export default function MiIiniciaPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ssoModal, setSsoModal] = useState<{
    launchData: any;
    courseItem: any;
  } | null>(null);
  const [selectedGradeCourseId, setSelectedGradeCourseId] =
    useState<number>(101);
  const [courseGrades, setCourseGrades] = useState<any[]>([]);
  const [gradeSavedMsg, setGradeSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest(
      `/campus/grades?courseId=${selectedGradeCourseId}`,
      {},
      accessToken,
    )
      .then((res: any) => {
        if (Array.isArray(res?.grades)) {
          setCourseGrades(res.grades);
        }
      })
      .catch(() => {});
  }, [accessToken, selectedGradeCourseId]);

  const handleSaveStudentGrade = async (student: any) => {
    if (!accessToken) return;
    setGradeSavedMsg(null);
    setError(null);
    try {
      await apiRequest(
        '/campus/grades',
        {
          method: 'POST',
          body: JSON.stringify({
            moodleCourseId: selectedGradeCourseId,
            studentEmail: student.email,
            studentName: student.name,
            taskGrade: student.taskGrade,
            quizGrade: student.quizGrade,
            progress: student.progress,
            feedback: student.feedback,
          }),
        },
        accessToken,
      );
      setGradeSavedMsg(
        `✔ Calificación de ${student.name} (${student.email}) guardada exitosamente en Supabase.`,
      );
      setTimeout(() => setGradeSavedMsg(null), 4000);
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
      .then((res) => {
        setDashboard(res);
      })
      .catch((err: any) => {
        setError(err.message || 'No se pudo cargar tu panel Mi IINICIA.');
      })
      .finally(() => setLoading(false));
  }, [accessToken, authLoading]);

  const handleLaunchCampus = async (courseItem: any) => {
    if (!accessToken) return;
    setError(null);
    try {
      const launchData = await apiRequest(
        `/campus/launch/${courseItem.course.id}`,
        { method: 'POST' },
        accessToken,
      );
      setSsoModal({ launchData, courseItem });
    } catch (err: any) {
      setError(err.message || 'No fue posible generar el acceso SSO al curso.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
        Cargando tu espacio personalizado Mi IINICIA...
      </div>
    );
  }

  if (!user || !dashboard) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Inicia sesión para acceder a Mi IINICIA
        </h1>
        <p className="text-sm text-slate-600">
          Tu panel se adapta automáticamente a tu rol (Estudiante, Profesor,
          Aspirante o Administrador).
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl font-bold bg-iinicia-primary text-white"
        >
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  const { primaryRole, profile, programs, authorizedCourses, admissionTracker, adminSummary } =
    dashboard;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Encabezado Personalizado por Rol (Sección 9.2) */}
      <header className="bg-gradient-to-r from-iinicia-navy to-iinicia-primary text-white rounded-2xl p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-iinicia-teal text-slate-950">
              Rol: {primaryRole}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-200 border border-white/20">
              Estado: {profile.status.toUpperCase()}
            </span>
            {profile.moodle_user_id && (
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                Moodle ID #{profile.moodle_user_id}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold">
            Bienvenido(a), {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-sm text-slate-200">
            Panel Mi IINICIA · Vista controlada por RBAC del lado servidor (CA-05,
            CA-06, CA-11)
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {(primaryRole === 'estudiante' ||
            primaryRole === 'profesor' ||
            primaryRole === 'admin' ||
            primaryRole === 'superadmin') && (
            <Link
              href="/campus"
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#0066ff] hover:bg-blue-500 text-white shadow transition"
            >
              Entrar al Campus Moodle →
            </Link>
          )}
          <Link
            href="/perfil"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition"
          >
            Ver Mi Perfil
          </Link>
          {(primaryRole === 'admin' || primaryRole === 'superadmin') && (
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
            >
              Abrir Panel Administrativo →
            </Link>
          )}
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium"
        >
          {error}
        </div>
      )}

      {/* VISTA EXCLUSIVA PARA ROL ASPIRANTE (Sección 6 y Flujo 7.1) */}
      {primaryRole === 'aspirante' && admissionTracker && (
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase text-amber-700">
                Seguimiento de Admisión · Sin acceso a cursos hasta autorización
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Estado de tu Solicitud: {admissionTracker.stage}
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            De acuerdo con las políticas de seguridad de IINICIA (Sección 6), tu
            cuenta con rol <strong>Aspirante</strong> no visualiza ni tiene
            acceso a cursos en Moodle hasta que un Administrador valide tu
            expediente, te asigne el rol <strong>Estudiante</strong> y autorice
            tu matrícula.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {admissionTracker.nextSteps.map((step: string, idx: number) => (
              <div
                key={step}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm"
              >
                <span className="text-xs font-bold text-iinicia-primary block mb-1">
                  Etapa {idx + 1}
                </span>
                <span className="font-medium text-slate-800">{step}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* VISTA EXCLUSIVA PARA ADMINISTRADOR EN MI IINICIA */}
      {adminSummary && (
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-iinicia-primary">
                Resumen Ejecutivo de Gestión
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Estado Operativo de la Plataforma
              </h2>
            </div>
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-iinicia-primary text-white hover:bg-teal-900 transition"
            >
              Gestionar Usuarios, Roles y Moodle →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Usuarios Totales</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {adminSummary.totalUsers}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-800">Pendientes de Alta</span>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">
                {adminSummary.pendingUsers}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800">
                Vinculados con Moodle
              </span>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1">
                {adminSummary.syncedWithMoodle}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
              <span className="text-xs text-teal-800">
                Matrículas Sincronizadas
              </span>
              <div className="text-2xl font-extrabold text-teal-900 mt-1">
                {adminSummary.totalEnrollments}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PROGRAMAS ASOCIADOS AL ESTUDIANTE */}
      {programs && programs.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Mi Programa Académico Asociado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((up: any) => (
              <div
                key={up.id}
                className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-iinicia-primary">
                    {up.program?.code} · Estatus: {up.academic_status.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-slate-900 mt-0.5">
                    {up.program?.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PANEL DIRECTO DE CALIFICACIONES: PROFESOR CALIFICA ALUMNOS / ESTUDIANTE VE SUS CALIFICACIONES */}
      {(primaryRole === 'profesor' ||
        primaryRole === 'estudiante' ||
        primaryRole === 'admin' ||
        primaryRole === 'superadmin') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0066ff]">
                {primaryRole === 'estudiante'
                  ? 'Boleta Académica en Tiempo Real · Supabase + Moodle'
                  : 'Evaluación Docente · Libro de Calificaciones en Tiempo Real'}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                {primaryRole === 'estudiante'
                  ? '📊 Mis Calificaciones y Retroalimentación del Profesor'
                  : '📝 Calificar Alumnos Matriculados'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {primaryRole === 'estudiante'
                  ? 'Consulta tus calificaciones de tareas, cuestionarios, promedio final y comentarios de tu profesor.'
                  : 'Modifica las calificaciones y retroalimentación de cualquier alumno y pulsa "Guardar Calificación" para actualizar su boleta al instante.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedGradeCourseId(101)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                  selectedGradeCourseId === 101
                    ? 'bg-[#0066ff] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Curso 1: Introducción a las TI (TI-101)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGradeCourseId(102)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                  selectedGradeCourseId === 102
                    ? 'bg-[#0066ff] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Curso 2: Desarrollo Web con React (WEB-202)
              </button>
            </div>
          </div>

          {gradeSavedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold">
              {gradeSavedMsg}
            </div>
          )}

          {primaryRole === 'estudiante' ? (
            <div className="grid grid-cols-1 gap-4">
              {courseGrades
                .filter(
                  (g) =>
                    g.email.toLowerCase() === profile.email.toLowerCase(),
                )
                .map((g) => {
                  const avg = Math.round((g.taskGrade + g.quizGrade) / 2);
                  return (
                    <div
                      key={`${selectedGradeCourseId}-${g.email}`}
                      className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-[#0066ff] uppercase">
                            {selectedGradeCourseId === 101
                              ? 'Curso 1 · Introducción a las Tecnologías de la Información (TI-101)'
                              : 'Curso 2 · Desarrollo Web con React (WEB-202)'}
                          </div>
                          <h3 className="text-lg font-extrabold text-slate-900">
                            Alumno: {g.name} ({g.email})
                          </h3>
                        </div>
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-extrabold ${
                            avg >= 70
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          Promedio Final: {avg} / 100 (
                          {avg >= 70 ? 'APROBADO' : 'POR ACREDITAR'})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white border border-slate-200">
                          <span className="text-xs text-slate-500">
                            Tarea / Actividad Práctica
                          </span>
                          <div className="text-2xl font-black text-slate-900 mt-1">
                            {g.taskGrade} <span className="text-sm font-normal text-slate-400">/ 100</span>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-slate-200">
                          <span className="text-xs text-slate-500">
                            Cuestionario Evaluable
                          </span>
                          <div className="text-2xl font-black text-slate-900 mt-1">
                            {g.quizGrade} <span className="text-sm font-normal text-slate-400">/ 100</span>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-slate-200">
                          <span className="text-xs text-slate-500">
                            Avance de Finalización
                          </span>
                          <div className="text-2xl font-black text-[#0066ff] mt-1">
                            {g.progress}%
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-slate-800">
                        <strong className="text-[#0066ff]">
                          👨‍🏫 Retroalimentación de tu Profesor:
                        </strong>{' '}
                        {g.feedback || 'Sin comentarios adicionales.'}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="space-y-4">
              {courseGrades.map((st) => {
                const avg = Math.round((st.taskGrade + st.quizGrade) / 2);
                return (
                  <div
                    key={`${selectedGradeCourseId}-${st.email}`}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-base text-slate-900">
                          👨‍🎓 {st.name}{' '}
                          <span className="text-xs font-mono text-slate-500">
                            ({st.email})
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Moodle Student ID #{st.moodleUserId} · Promedio
                          calculado:{' '}
                          <strong
                            className={
                              avg >= 70 ? 'text-emerald-700' : 'text-rose-600'
                            }
                          >
                            {avg} / 100 ({avg >= 70 ? 'Aprobado' : 'Por acreditar'})
                          </strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveStudentGrade(st)}
                        className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#0066ff] hover:bg-blue-700 text-white shadow-sm transition shrink-0"
                      >
                        💾 Guardar Calificación del Alumno
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Calificación Tarea (0 - 100):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={st.taskGrade}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCourseGrades((prev) =>
                              prev.map((item) =>
                                item.email.toLowerCase() ===
                                st.email.toLowerCase()
                                  ? { ...item, taskGrade: val }
                                  : item,
                              ),
                            );
                          }}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Calificación Cuestionario (0 - 100):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={st.quizGrade}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCourseGrades((prev) =>
                              prev.map((item) =>
                                item.email.toLowerCase() ===
                                st.email.toLowerCase()
                                  ? { ...item, quizGrade: val }
                                  : item,
                              ),
                            );
                          }}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Avance del Curso (%):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={st.progress}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCourseGrades((prev) =>
                              prev.map((item) =>
                                item.email.toLowerCase() ===
                                st.email.toLowerCase()
                                  ? { ...item, progress: val }
                                  : item,
                              ),
                            );
                          }}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Retroalimentación / Comentario del Profesor para el
                        Alumno:
                      </label>
                      <input
                        type="text"
                        value={st.feedback}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCourseGrades((prev) =>
                            prev.map((item) =>
                              item.email.toLowerCase() ===
                              st.email.toLowerCase()
                                ? { ...item, feedback: val }
                                : item,
                            ),
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
                        placeholder="Escribe un comentario o retroalimentación para el alumno..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* CURSOS AUTORIZADOS EN CAMPUS MOODLE (CA-11, CA-12, CA-13) */}
      {(primaryRole === 'estudiante' || primaryRole === 'profesor') && (
        <section className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
              {primaryRole === 'profesor'
                ? 'Flujo 7.2 y CA-13 · Cursos Asignados con Rol Docente (Teacher)'
                : 'Flujo 7.3 y CA-12 · Cursos Autorizados con Matrícula de Estudiante (Student)'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              {primaryRole === 'profesor'
                ? 'Mis Cursos Asignados para Impartición en Moodle'
                : 'Mis Cursos Matriculados en el Campus Moodle'}
            </h2>
          </div>

          {authorizedCourses && authorizedCourses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {authorizedCourses.map((item: any) => (
                <article
                  key={item.enrollment_id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-800">
                        {item.course.moodle_shortname} (ID Moodle:{' '}
                        {item.course.moodle_course_id})
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.moodle_role === 'editingteacher'
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        Rol en Moodle: {item.moodle_role_label}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                      {item.course.course_name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {item.course.description}
                    </p>

                    {/* Funciones habilitadas según Rol en Moodle (Punto 9 de Prueba de Concepto Sección 16) */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-700">
                        Permisos efectivos en este curso ({item.moodle_role_label}):
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {item.role_capabilities_in_moodle.map((cap: string) => (
                          <li key={cap}>• {cap}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Unidades y Actividades configuradas en Moodle (Sección 8.1) */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-500">
                        Estructura académica en Moodle:
                      </div>
                      {item.course.syllabus?.map((unit: any) => (
                        <div
                          key={unit.unit}
                          className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
                        >
                          <div className="font-bold text-slate-800">
                            {unit.unit}: {unit.title}
                          </div>
                          <ul className="text-slate-600 mt-1 space-y-0.5 pl-3 list-disc">
                            {unit.activities.map((act: string) => (
                              <li key={act}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">
                      Sincronización: {item.enrollment_status.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLaunchCampus(item)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-iinicia-primary text-white hover:bg-teal-900 transition"
                    >
                      Acceder al Curso en Moodle (SSO) →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-600">
              Aún no tienes cursos matriculados. Un Administrador debe autorizar
              tu inscripción desde el Panel Administrativo.
            </div>
          )}
        </section>
      )}

      {/* MODAL INTERACTIVO DE ACCESO SSO AL CAMPUS MOODLE (Sección 8.1 y 11) */}
      {ssoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sso-title"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-teal-50 text-iinicia-primary border border-teal-200">
                  Sección 11 · Single Sign-On Servidor-a-Servidor
                </span>
                <h2
                  id="modal-sso-title"
                  className="text-2xl font-extrabold text-slate-900 mt-2"
                >
                  {ssoModal.courseItem.course.course_name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Rol autenticado en Moodle:{' '}
                  <strong>{ssoModal.launchData.assignedMoodleRole}</strong> ·
                  Moodle User ID #{ssoModal.launchData.moodleUserId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSsoModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Evidencia de Seguridad Sección 11 y CA-14 */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-2">
              <div className="font-bold text-teal-300">
                ✔ Ticket SSO Efímero Generado por NestJS (Expira en{' '}
                {ssoModal.launchData.expiresInSeconds}s)
              </div>
              <p className="text-slate-300">
                {ssoModal.launchData.securityGuarantee}
              </p>
              <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-emerald-300 break-all">
                {ssoModal.launchData.launchUrl}
              </div>
            </div>

            {/* Checklist del Contenido Mínimo Requerido en Moodle (Sección 8.1) */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase text-slate-700">
                Contenido Mínimo Verificado en el Aula Moodle (Sección 8.1 · CA-08):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ssoModal.courseItem.course.minimum_content_checklist?.map(
                  (check: string) => (
                    <div
                      key={check}
                      className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium"
                    >
                      ✔ {check}
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Acciones diferenciadas Profesor vs Estudiante dentro del Aula */}
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-2">
              <h4 className="text-sm font-bold text-iinicia-navy">
                Vista en Moodle para tu rol ({ssoModal.launchData.assignedMoodleRole}):
              </h4>
              {ssoModal.courseItem.moodle_role === 'editingteacher' ? (
                <p className="text-xs text-slate-700">
                  Como <strong>Profesor (Teacher)</strong> tienes habilitado el
                  modo de edición del curso, gestión del banco de preguntas,
                  calificación de entregas de Ana Sofía García y Carlos Eduardo
                  López, y reportes de finalización de actividad/curso.
                </p>
              ) : (
                <p className="text-xs text-slate-700">
                  Como <strong>Estudiante (Student)</strong> puedes consultar
                  los recursos PDF/páginas, participar en el foro académico,
                  subir tu actividad práctica, responder el cuestionario y
                  consultar tu calificación personal y barra de finalización.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Link
                href={`/campus?courseId=${ssoModal.launchData.moodleCourseId}&sso_ticket=${encodeURIComponent(
                  ssoModal.launchData.launchUrl,
                )}`}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#0066ff] text-white hover:bg-blue-700 transition"
              >
                Ingresar al Aula Virtual Moodle (SSO) →
              </Link>
              <button
                type="button"
                onClick={() => setSsoModal(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Volver a Mi IINICIA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
