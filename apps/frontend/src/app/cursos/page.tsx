import Link from 'next/link';
import React from 'react';
import Reveal from '../../components/Reveal';
import { FALLBACK_PROGRAMS } from '../../lib/api';

const COURSE_VISUALS: Record<
  string,
  { gradient: string; icon: string; overlayCode: string }
> = {
  'SIS-WEB-101': {
    gradient: 'from-indigo-950 via-slate-900 to-blue-900',
    icon: '⚛️',
    overlayCode: '<App stack="React + Next.js + NestJS" />',
  },
  'SIS-SEC-102': {
    gradient: 'from-slate-950 via-blue-950 to-cyan-950',
    icon: '🛡️',
    overlayCode: 'PENTEST_SCAN: [OWASP_TOP_10, TLS_OK]',
  },
  'SIS-IA-103': {
    gradient: 'from-slate-900 via-indigo-950 to-purple-950',
    icon: '🧠',
    overlayCode: 'model.fit(X_train, y_train, epochs=50)',
  },
  'SIS-CLD-104': {
    gradient: 'from-slate-900 via-sky-950 to-blue-950',
    icon: '☁️',
    overlayCode: 'kubectl apply -f cluster-deployment.yaml',
  },
  'SIS-DBA-105': {
    gradient: 'from-blue-950 via-slate-900 to-emerald-950',
    icon: '🗄️',
    overlayCode: 'SELECT * FROM users WHERE rls_active = true;',
  },
  'SIS-NET-106': {
    gradient: 'from-slate-950 via-slate-800 to-sky-900',
    icon: '🌐',
    overlayCode: 'ip route add 10.20.0.0/16 via 192.168.1.1',
  },
};

export default function CursosPage() {
  return (
    <div className="bg-[#e8f4fd] min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-12 overflow-hidden">
      {/* Cintillo Superior */}
      <Reveal variant="up">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl px-6 py-4 shadow-sm border border-sky-100 text-sm text-slate-600 transition duration-300 hover:shadow-md">
          Tu educación IINICIA hoy, estés donde estés. Especialízate en la rama de{' '}
          <strong className="text-slate-900">Informática y Sistemas</strong>.{' '}
          <Link
            href="/registro"
            className="font-extrabold text-[#0066ff] hover:underline"
          >
            Sé parte de NOSOTROS
          </Link>
          .
        </div>
      </Reveal>

      {/* Catálogo de Cursos de Informática y Sistemas con sus 4 Módulos */}
      <section className="max-w-6xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 space-y-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0066ff]">
                Rama de Informática y Sistemas · Campus Virtual Moodle
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
                Cursos de Informática y Sistemas (Con Módulos)
              </h1>
            </div>
            <Link
              href="/mi-iinicia"
              className="text-xs font-extrabold text-[#0066ff] hover:underline transition hover:translate-x-1"
            >
              ¿Ya estás matriculado? Ir a Mi IINICIA →
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FALLBACK_PROGRAMS.map((course, idx) => {
            const visual = COURSE_VISUALS[course.code] || {
              gradient: 'from-slate-800 via-blue-950 to-sky-900',
              icon: '💻',
              overlayCode: 'SYS.INIT(IINICIA_COURSE)',
            };

            return (
              <Reveal
                key={course.id}
                variant="zoom"
                delay={idx * 90}
                className="h-full"
              >
                <article className="group card-hover-3d relative h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="absolute top-3 left-0 z-10 bg-emerald-500 text-white text-xs font-extrabold px-3 py-1 rounded-r-md shadow">
                      Free
                    </div>

                    <div
                      className={`relative h-48 bg-gradient-to-br ${visual.gradient} p-6 flex flex-col justify-between text-white overflow-hidden`}
                    >
                      <div
                        aria-hidden="true"
                        className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-sky-400/20 blur-2xl animate-float-slow"
                      />
                      <div className="text-right font-mono text-[10px] text-sky-300/80">
                        {course.code}
                      </div>
                      <div className="text-5xl transform group-hover:scale-110 group-hover:-rotate-3 transition duration-300">
                        {visual.icon}
                      </div>
                      <div className="font-mono text-[11px] bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded border border-white/10 text-emerald-300 truncate">
                        {visual.overlayCode}
                      </div>
                    </div>

                    {/* Cuerpo de la Tarjeta + Lista de los 4 Módulos */}
                    <div className="p-5 space-y-3">
                      <div className="text-[11px] font-bold text-[#0066ff] uppercase tracking-wide">
                        {course.duration} · {course.modality}
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 leading-snug group-hover:text-[#0066ff] transition">
                        {course.title}
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {course.summary}
                      </p>

                      {/* Bloque de Módulos del Curso */}
                      <div className="pt-2 space-y-2 border-t border-slate-100">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                          📚 Módulos del Curso ({course.semesters.length}):
                        </div>
                        <div className="space-y-2">
                          {course.semesters.map((mod) => (
                            <div
                              key={mod.semester}
                              className="module-card-hover p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1"
                            >
                              <div className="text-xs font-bold text-[#0066ff]">
                                {mod.title}
                              </div>
                              <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-0.5">
                                {mod.subjects.map((sub) => (
                                  <li key={sub}>{sub}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-2 flex flex-col gap-2">
                    <Link
                      href={`/oferta-academica/${course.slug}`}
                      className="block w-full text-center py-2 rounded-lg border border-slate-300 hover:border-[#0066ff] text-slate-700 hover:text-[#0066ff] text-xs font-bold transition hover:scale-[1.01]"
                    >
                      Ver ficha completa del curso
                    </Link>
                    <Link
                      href="/registro"
                      className="group/btn relative overflow-hidden block w-full text-center py-2.5 rounded-lg bg-[#0066ff] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition hover:scale-[1.02]"
                    >
                      <span className="relative z-10">
                        Enroll Now / Inscribirme
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shine"
                      />
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Sección "Próximamente..." */}
      <Reveal variant="up">
        <section className="max-w-6xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 flex flex-col items-center">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
                Próximamente...
              </h2>
              <div className="relative w-56 h-56 rounded-3xl bg-[#312e81] border-4 border-slate-900 shadow-xl p-4 flex flex-col justify-between animate-bob">
                <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-center font-mono font-black text-4xl text-sky-300/80 select-none">
                  {'</>'}
                </div>
                <div className="text-center text-6xl -mb-4 drop-shadow">🛠️</div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-snug">
                ¡Estamos preparando nuevos laboratorios de programación, redes y
                ciberseguridad para ti!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mientras tanto, explora los cursos, certificaciones y diplomados
                de la rama de Informática y Sistemas que ya están activos en
                nuestra plataforma.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/certificaciones"
                  className="px-7 py-3 rounded-full bg-[#0066ff] hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition hover:scale-105"
                >
                  VER CERTIFICACIONES EN TI
                </Link>
                <Link
                  href="/diplomados"
                  className="px-6 py-3 rounded-full border border-slate-300 hover:border-[#0066ff] text-slate-700 hover:text-[#0066ff] text-xs font-extrabold uppercase tracking-wider transition hover:scale-105"
                >
                  VER DIPLOMADOS EN SISTEMAS
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
