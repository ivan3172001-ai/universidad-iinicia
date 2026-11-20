import Link from 'next/link';
import React from 'react';
import Reveal from '../../components/Reveal';

const DIPLOMADOS = [
  {
    id: 'dip-inf',
    badge: 'Free',
    title: 'Diplomado en Ingeniería Informática y Desarrollo Full-Stack',
    duration: '160 Horas · 4 Módulos en Campus Moodle',
    desc: 'Formación intensiva en desarrollo de software moderno con React, Next.js, Node.js, bases de datos PostgreSQL y arquitectura de microservicios.',
    gradient: 'from-slate-800 via-sky-900 to-blue-950',
    icon: '👨‍💻',
    codeTag: 'DIP-INF-01',
    modules: [
      {
        title: 'Módulo 1 · Fundamentos de Ingeniería de Software y Web',
        topics: ['Arquitectura Web, Git, HTML5, CSS3 y TypeScript', 'Diseño de Interfaces con Tailwind CSS'],
      },
      {
        title: 'Módulo 2 · Frontend Avanzado con React y Next.js',
        topics: ['Componentes, Hooks, App Router y SSR', 'Consumo Seguro de APIs y Estado Global'],
      },
      {
        title: 'Módulo 3 · Backend con Node.js, NestJS y PostgreSQL',
        topics: ['Arquitectura Modular en NestJS y ORM/SQL', 'Autenticación con Google OAuth, JWT y RLS'],
      },
      {
        title: 'Módulo 4 · Despliegue en la Nube y Proyecto de Diplomado',
        topics: ['Contenedores Docker y CI/CD', 'Entrega de Plataforma Full-Stack en Producción'],
      },
    ],
  },
  {
    id: 'dip-sec-net',
    badge: 'Free',
    title: 'Diplomado en Ciberseguridad, Redes y Administración de Sistemas',
    duration: '140 Horas · 4 Módulos · Laboratorios de Pentesting y Linux',
    desc: 'Programa práctico orientado al aseguramiento de redes empresariales, servidores Linux, hacking ético, análisis forense y respuesta a incidentes.',
    gradient: 'from-slate-950 via-indigo-950 to-slate-900',
    icon: '🛡️',
    codeTag: 'DIP-SEC-02',
    modules: [
      {
        title: 'Módulo 1 · Arquitectura de Redes TCP/IP y SysAdmin Linux',
        topics: ['Subnetting VLSM, VLANs y Enrutamiento', 'Administración Avanzada de Servidores Linux'],
      },
      {
        title: 'Módulo 2 · Hacking Ético y Pruebas de Penetración',
        topics: ['Reconocimiento, Nmap y Evaluación de Vulnerabilidades', 'Auditoría Web OWASP Top 10 en Kali Linux'],
      },
      {
        title: 'Módulo 3 · Seguridad Defensiva, Firewalls y Hardening',
        topics: ['Configuración de Firewalls, IDS/IPS y VPNs', 'Protección de Infraestructura y Directorio Activo'],
      },
      {
        title: 'Módulo 4 · Forense Digital, SIEM y Normativa ISO 27001',
        topics: ['Respuesta a Incidentes y Cadena de Custodia', 'Proyecto Final de Auditoría de Seguridad'],
      },
    ],
  },
  {
    id: 'dip-ia-cloud',
    badge: 'Free',
    title: 'Diplomado en Inteligencia Artificial, Cloud Computing y DevOps',
    duration: '160 Horas · 4 Módulos · Python, Docker y Kubernetes',
    desc: 'Especialización en despliegue de modelos de Machine Learning e IA generativa sobre infraestructura cloud automatizada con CI/CD.',
    gradient: 'from-blue-950 via-slate-900 to-cyan-950',
    icon: '☁️',
    codeTag: 'DIP-IACLD-03',
    modules: [
      {
        title: 'Módulo 1 · Programación en Python y Ciencia de Datos',
        topics: ['Procesamiento de Datos con NumPy y Pandas', 'Ingeniería de Características y Análisis Exploratorio'],
      },
      {
        title: 'Módulo 2 · Modelos de Machine Learning y Deep Learning',
        topics: ['Algoritmos Supervisados y No Supervisados', 'Redes Neuronales, NLP y Modelos Generativos (LLMs)'],
      },
      {
        title: 'Módulo 3 · Infraestructura Cloud, Docker y Kubernetes',
        topics: ['Microservicios en Contenedores para IA (FastAPI)', 'Orquestación de Clústeres y Escalado Automático'],
      },
      {
        title: 'Módulo 4 · MLOps, Observabilidad y Proyecto Integrador',
        topics: ['Pipelines CI/CD y Monitoreo con Prometheus/Grafana', 'Proyecto Final de IA en la Nube'],
      },
    ],
  },
];

export default function DiplomadosPage() {
  return (
    <div className="bg-[#e8f4fd] min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-10 overflow-hidden">
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

      <section className="max-w-6xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 space-y-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0066ff]">
                Especialización en Tecnologías de la Información · IINICIA
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
                Diplomados Online en Informática y Sistemas (Con Módulos)
              </h1>
            </div>
            <Link
              href="/cursos"
              className="text-xs font-extrabold text-[#0066ff] hover:underline transition hover:translate-x-1"
            >
              Ver todos los Cursos de Informática y Sistemas →
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DIPLOMADOS.map((dip, idx) => (
            <Reveal
              key={dip.id}
              variant="zoom"
              delay={idx * 120}
              className="h-full"
            >
              <article className="group card-hover-3d relative h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  <div className="absolute top-3 left-0 z-10 bg-emerald-500 text-white text-xs font-extrabold px-3 py-1 rounded-r-md shadow">
                    {dip.badge}
                  </div>

                  <div
                    className={`relative h-52 bg-gradient-to-br ${dip.gradient} p-6 flex flex-col justify-between text-white overflow-hidden`}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute -left-8 -top-8 w-32 h-32 rounded-full bg-sky-400/20 blur-2xl animate-float-slow"
                    />
                    <div className="text-right font-mono text-[10px] text-sky-300">
                      {dip.codeTag}
                    </div>
                    <div className="text-5xl transform group-hover:scale-110 group-hover:-rotate-3 transition duration-300">
                      {dip.icon}
                    </div>
                    <div className="text-[11px] font-semibold text-sky-200 bg-white/10 backdrop-blur-sm px-3 py-1 rounded w-fit">
                      {dip.duration}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h2 className="text-xl font-extrabold text-slate-900 leading-snug group-hover:text-[#0066ff] transition">
                      {dip.title}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {dip.desc}
                    </p>

                    {/* Módulos del Diplomado */}
                    <div className="pt-2 space-y-2 border-t border-slate-100">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        📚 Módulos del Diplomado ({dip.modules.length}):
                      </div>
                      <div className="space-y-2">
                        {dip.modules.map((mod) => (
                          <div
                            key={mod.title}
                            className="module-card-hover p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1"
                          >
                            <div className="text-xs font-bold text-[#0066ff]">
                              {mod.title}
                            </div>
                            <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-0.5">
                              {mod.topics.map((t) => (
                                <li key={t}>{t}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-2">
                  <Link
                    href="/registro"
                    className="relative overflow-hidden block w-full text-center py-2.5 rounded-lg bg-[#0066ff] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition hover:scale-[1.02]"
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
          ))}
        </div>
      </section>
    </div>
  );
}
