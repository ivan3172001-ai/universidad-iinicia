import Link from 'next/link';
import React from 'react';
import Reveal from '../../components/Reveal';

const CERTIFICACIONES = [
  {
    id: 'cert-inf',
    badge: 'Free',
    title: 'Certificación Universitaria en Ingeniería Informática y Software',
    duration: '120 Horas · 4 Módulos · Validez Curricular Oficial',
    desc: 'Certifica tus competencias en arquitectura de software full-stack, estructuras de datos, APIs REST, microservicios y calidad de código.',
    gradient: 'from-slate-950 via-blue-950 to-indigo-900',
    icon: '🖥️',
    codeTag: 'CERT-INF-2026',
    modules: [
      {
        title: 'Módulo 1 · Ingeniería de Requerimientos y Arquitectura Limpia',
        topics: ['Patrones de Diseño (SOLID, Clean Architecture)', 'Modelado UML y Diseño de Sistemas Escalables'],
      },
      {
        title: 'Módulo 2 · Desarrollo Frontend y Backend con TypeScript',
        topics: ['Aplicaciones Web con React 18 y Next.js', 'APIs RESTful con Node.js y NestJS'],
      },
      {
        title: 'Módulo 3 · Persistencia en Bases de Datos y Seguridad',
        topics: ['PostgreSQL, Transacciones y Row Level Security', 'Autenticación OAuth 2.0, JWT y RBAC'],
      },
      {
        title: 'Módulo 4 · Pruebas de Software y Evaluación de Certificación',
        topics: ['Testing Unitario, Integración y E2E', 'Proyecto Integrador de Certificación'],
      },
    ],
  },
  {
    id: 'cert-cloud-sec',
    badge: 'Free',
    title: 'Certificación en Arquitectura Cloud, DevOps y Ciberseguridad',
    duration: '90 Horas · 4 Módulos · Campus Virtual Moodle',
    desc: 'Diseño de infraestructuras seguras en la nube, identidad federada, protección de APIs, Row Level Security, Docker, Kubernetes y Pentesting.',
    gradient: 'from-slate-900 via-sky-950 to-slate-900',
    icon: '🔐',
    codeTag: 'CERT-CLOUD-02',
    modules: [
      {
        title: 'Módulo 1 · Seguridad en Redes y Servidores Linux',
        topics: ['Hardening de Servidores y Criptografía TLS', 'Firewalls, VPNs y Segmentación de Redes'],
      },
      {
        title: 'Módulo 2 · Contenedores Docker y Orquestación Kubernetes',
        topics: ['Imágenes Seguras y Docker Compose', 'Despliegue de Clústeres y Alta Disponibilidad'],
      },
      {
        title: 'Módulo 3 · Automatización CI/CD y DevSecOps',
        topics: ['Pipelines Automatizados en GitHub Actions', 'Escaneo de Vulnerabilidades y Gestión de Secretos'],
      },
      {
        title: 'Módulo 4 · Auditoría OWASP y Respuesta a Incidentes',
        topics: ['Pentesting de Aplicaciones Web (OWASP Top 10)', 'Monitoreo SIEM y Examen de Certificación'],
      },
    ],
  },
  {
    id: 'cert-data-ia',
    badge: 'Free',
    title: 'Certificación en Inteligencia Artificial, Ciencia de Datos y SQL',
    duration: '100 Horas · 4 Módulos · Especialidad en Sistemas',
    desc: 'Modelado avanzado en PostgreSQL, programación científica con Python, entrenamiento de modelos de Machine Learning y despliegue de LLMs.',
    gradient: 'from-indigo-950 via-slate-900 to-cyan-950',
    icon: '🧠',
    codeTag: 'CERT-IA-03',
    modules: [
      {
        title: 'Módulo 1 · SQL Avanzado e Ingeniería de Datos',
        topics: ['Consultas Analíticas en PostgreSQL y Pipelines ETL', 'Optimización de Índices y Modelado Dimensional'],
      },
      {
        title: 'Módulo 2 · Análisis de Datos con Python, NumPy y Pandas',
        topics: ['Limpieza y Transformación de Datasets', 'Visualización Estadística de Datos'],
      },
      {
        title: 'Módulo 3 · Machine Learning y Deep Learning',
        topics: ['Modelos Predictivos con Scikit-Learn', 'Redes Neuronales con PyTorch y TensorFlow'],
      },
      {
        title: 'Módulo 4 · IA Generativa, LLMs y Despliegue de Modelos',
        topics: ['Arquitecturas RAG y Bases Vectoriales', 'Proyecto de Certificación en IA Aplicada'],
      },
    ],
  },
];

export default function CertificacionesPage() {
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
                Reconocimiento Profesional en TI · IINICIA
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
                Certificaciones en Informática y Sistemas (Con Módulos)
              </h1>
            </div>
            <Link
              href="/diplomados"
              className="text-xs font-extrabold text-[#0066ff] hover:underline transition hover:translate-x-1"
            >
              Ver también nuestros Diplomados en Sistemas →
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CERTIFICACIONES.map((cert, idx) => (
            <Reveal
              key={cert.id}
              variant="zoom"
              delay={idx * 120}
              className="h-full"
            >
              <article className="group card-hover-3d relative h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  <div className="absolute top-3 left-0 z-10 bg-emerald-500 text-white text-xs font-extrabold px-3 py-1 rounded-r-md shadow">
                    {cert.badge}
                  </div>

                  <div
                    className={`relative h-52 bg-gradient-to-br ${cert.gradient} p-6 flex flex-col justify-between text-white overflow-hidden`}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-sky-400/20 blur-2xl animate-float-slow"
                    />
                    <div className="text-right font-mono text-[10px] text-sky-300">
                      {cert.codeTag}
                    </div>
                    <div className="text-5xl transform group-hover:scale-110 group-hover:rotate-3 transition duration-300">
                      {cert.icon}
                    </div>
                    <div className="text-[11px] font-semibold text-sky-200 bg-white/10 backdrop-blur-sm px-3 py-1 rounded w-fit">
                      {cert.duration}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h2 className="text-xl font-extrabold text-slate-900 leading-snug group-hover:text-[#0066ff] transition">
                      {cert.title}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cert.desc}
                    </p>

                    {/* Módulos de la Certificación */}
                    <div className="pt-2 space-y-2 border-t border-slate-100">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        📚 Módulos de la Certificación ({cert.modules.length}):
                      </div>
                      <div className="space-y-2">
                        {cert.modules.map((mod) => (
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
