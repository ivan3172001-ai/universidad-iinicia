'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import Reveal from '../../components/Reveal';
import { FALLBACK_PROGRAMS, ProgramItem } from '../../lib/api';

export default function OfertaAcademicaPage() {
  const [programs] = useState<ProgramItem[]>(FALLBACK_PROGRAMS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [collapsedSlugs, setCollapsedSlugs] = useState<Record<string, boolean>>({});

  const toggleCollapse = (slug: string) => {
    setCollapsedSlugs((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const filtered = programs.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle =
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q);
    const matchSubjects = p.semesters?.some((sem) =>
      sem.subjects.some((sub) => sub.toLowerCase().includes(q)),
    );
    return matchTitle || matchSubjects;
  });

  return (
    <div className="bg-[#e8f4fd] min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-10 overflow-hidden">
      <Reveal variant="up">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl px-6 py-4 shadow-sm border border-sky-100 text-sm text-slate-600 transition duration-300 hover:shadow-md">
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

      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 space-y-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0066ff]">
                Universidad IINICIA · Rama de Informática y Sistemas
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                Catálogo de Cursos en Informática y Sistemas
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                Consulta el temario completo por módulos prácticos (Módulo 1 al
                Módulo 4) de nuestros cursos especializados en desarrollo de
                software, ciberseguridad, IA, cloud, bases de datos y redes.
              </p>
            </div>

            <div className="w-full md:w-80">
              <label
                htmlFor="search-curso"
                className="block text-xs font-bold uppercase text-slate-600 mb-1"
              >
                Buscar curso o tecnología
              </label>
              <input
                id="search-curso"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej. React, Python, Ciberseguridad, SQL, Docker..."
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066ff] transition"
              />
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6">
          {filtered.map((prog, idx) => {
            const isExpanded = !collapsedSlugs[prog.slug];
            return (
              <Reveal key={prog.id} variant="up" delay={idx * 80}>
                <article className="group card-hover-3d bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500 text-white">
                          Curso #{idx + 1} · {prog.duration}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          Clave: {prog.code}
                        </span>
                        <span className="text-xs text-slate-500">
                          Modalidad: {prog.modality}
                        </span>
                      </div>

                      <h2 className="text-2xl font-extrabold text-slate-900 group-hover:text-[#0066ff] transition">
                        {prog.title}
                      </h2>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {prog.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleCollapse(prog.slug)}
                        className="px-4 py-2.5 rounded-full text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition hover:scale-105"
                      >
                        {isExpanded
                          ? '▲ Ocultar módulos'
                          : '▼ Mostrar los 4 módulos'}
                      </button>
                      <Link
                        href={`/oferta-academica/${prog.slug}`}
                        className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#2b7de9] hover:bg-[#0066ff] text-white transition hover:scale-105"
                      >
                        Ver temario completo →
                      </Link>
                      <Link
                        href="/registro"
                        className="relative overflow-hidden px-5 py-2.5 rounded-full text-xs font-extrabold bg-[#0066ff] hover:bg-blue-700 text-white shadow-sm transition hover:scale-105"
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
                  </div>

                  {/* Módulos Visibles por Defecto */}
                  {isExpanded && prog.semesters && (
                    <div className="pt-5 border-t border-slate-100 animate-fade-up">
                      <h3 className="text-xs font-extrabold uppercase text-[#0066ff] mb-4">
                        Temario Oficial por Módulos ({prog.title})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {prog.semesters.map((sem) => (
                          <div
                            key={sem.semester}
                            className="module-card-hover p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                          >
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                              <span className="font-extrabold text-sm text-slate-900">
                                {sem.title}
                              </span>
                              <span className="text-[11px] font-semibold text-[#0066ff]">
                                {sem.subjects.length} temas
                              </span>
                            </div>
                            <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                              {sem.subjects.map((sub) => (
                                <li key={sub}>{sub}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
