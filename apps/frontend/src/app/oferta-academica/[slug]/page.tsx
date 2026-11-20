import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';
import { FALLBACK_PROGRAMS } from '../../../lib/api';

export default function ProgramDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const program = FALLBACK_PROGRAMS.find((p) => p.slug === params.slug);
  if (!program) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div>
        <Link
          href="/cursos"
          className="text-sm font-semibold text-[#0066ff] hover:underline"
        >
          ← Volver al Catálogo de Cursos de Informática y Sistemas
        </Link>
      </div>

      <header className="bg-gradient-to-r from-[#050c21] to-[#0066ff] text-white rounded-2xl p-8 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500 text-white">
            Free · Informática y Sistemas
          </span>
          <span className="text-xs font-mono text-slate-200">
            Clave: {program.code}
          </span>
          <span className="text-xs text-slate-200">
            Modalidad: {program.modality}
          </span>
          <span className="text-xs text-slate-200">
            Duración: {program.duration}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold">{program.title}</h1>
        <p className="text-sky-200 font-medium">{program.summary}</p>
        <p className="text-slate-200 leading-relaxed max-w-4xl">
          {program.description}
        </p>

        <div className="pt-2 flex flex-wrap gap-4">
          <Link
            href="/registro"
            className="px-6 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider bg-white text-[#0066ff] hover:bg-sky-50 transition"
          >
            Inscribirme a este Curso
          </Link>
          <Link
            href="/cursos"
            className="px-5 py-3 rounded-full font-semibold text-xs uppercase tracking-wider border border-white/30 hover:bg-white/10 transition"
          >
            Ver más cursos de Sistemas
          </Link>
        </div>
      </header>

      {/* Temario por Módulos */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0066ff]">
              Temario Oficial IINICIA · Informática y Sistemas
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Contenido del Curso por Módulos Prácticos
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {program.duration} · Incluye Laboratorios y Proyecto Final
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {program.semesters?.map((sem) => (
            <div
              key={sem.semester}
              className="rounded-xl bg-slate-50 border border-slate-200 p-6 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <span className="px-3 py-1 rounded-md text-xs font-extrabold uppercase bg-[#050c21] text-sky-300">
                    {sem.title}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {sem.subjects.length} temas
                  </span>
                </div>

                <ul className="space-y-2 text-sm text-slate-700">
                  {sem.subjects.map((subject) => (
                    <li
                      key={subject}
                      className="flex items-start gap-2 leading-snug"
                    >
                      <span className="text-[#0066ff] font-bold mt-0.5">•</span>
                      <span>{subject}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vinculación con Campus Virtual Moodle */}
      <section className="bg-[#050c21] text-white rounded-2xl p-8 space-y-4">
        <h2 className="text-xl font-bold text-sky-300">
          Acceso al Campus Virtual Moodle de IINICIA
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Una vez que completas tu registro y se autoriza tu inscripción en{' '}
          <strong>{program.title}</strong>, el sistema sincroniza tu cuenta con
          Moodle (`moodle_user_id`) y habilita tus laboratorios, prácticas y
          evaluaciones desde <strong>Mi IINICIA</strong>.
        </p>
      </section>
    </div>
  );
}
