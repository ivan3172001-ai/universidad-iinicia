import Link from 'next/link';
import React from 'react';
import { FALLBACK_PROGRAMS } from '../lib/api';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';

const WHY_CHOOSE_US = [
  {
    title: 'Rutas de Informática y Sistemas',
    desc: 'Formación técnica intensiva en Desarrollo de Software, Ciberseguridad, Inteligencia Artificial, Cloud, Redes y Bases de Datos.',
    href: '/cursos',
    icon: '💻',
  },
  {
    title: 'Certificaciones en TI',
    desc: 'Valida tus competencias en ingeniería de software, seguridad informática y arquitectura cloud con validez curricular.',
    href: '/certificaciones',
    icon: '🏅',
  },
  {
    title: 'Diplomados de Especialización',
    desc: 'Programas prácticos por módulos para dominar tecnologías de vanguardia en sistemas computacionales.',
    href: '/diplomados',
    icon: '📘',
  },
  {
    title: 'Laboratorios en Campus Moodle',
    desc: 'Aprende escribiendo código real, configurando servidores y resolviendo retos prácticos en nuestro Campus Virtual.',
    href: '/oferta-academica',
    icon: '⚡',
  },
  {
    title: 'Badges Digitales Verificables',
    desc: 'Insignias digitales por cada módulo y tecnología dominada (React, Python, Docker, SQL, Linux y Pentesting).',
    href: '/mi-iinicia',
    icon: '🛡️',
  },
  {
    title: 'Mentores y Tutores 24/7',
    desc: 'Acompañamiento docente por ingenieros de software, arquitectos cloud y especialistas en ciberseguridad.',
    href: '/universidad',
    icon: '👨‍🏫',
  },
];

const TECH_TICKER = [
  'React',
  'Python',
  'Docker',
  'SQL',
  'Linux',
  'Pentesting',
  'Next.js',
  'Node.js',
  'TypeScript',
  'AWS Cloud',
  'Redes',
  'MongoDB',
  'Git',
  'Ciberseguridad',
];

const TESTIMONIALS = [
  {
    name: 'Emma Hart',
    role: 'Estudiante de Desarrollo Web Full-Stack (React & Next.js)',
    avatarBg: 'from-sky-500 to-blue-700',
    initials: 'EH',
    quote:
      '“Estudiar programación y desarrollo web en IINICIA ha sido una excelente decisión. Los proyectos prácticos en React y TypeScript me prepararon para el mundo laboral.”',
  },
  {
    name: 'Eddie Johnson',
    role: 'Estudiante de Ciberseguridad y Hacking Ético',
    avatarBg: 'from-indigo-500 to-purple-700',
    initials: 'EJ',
    quote:
      '“La plataforma integra de forma impecable mis cursos de seguridad informática y laboratorios en el Campus Virtual. El acompañamiento de los instructores es extraordinario.”',
  },
  {
    name: 'Jonathan Doe',
    role: 'Egresado del Diplomado en Ingeniería Informática',
    avatarBg: 'from-rose-500 to-red-700',
    initials: 'JD',
    quote:
      '“IINICIA me permitió especializarme en bases de datos SQL y arquitectura cloud desde casa, con excelente contenido práctico y enfoque 100% en sistemas.”',
  },
  {
    name: 'Mike Edward',
    role: 'Estudiante de Inteligencia Artificial y Python',
    avatarBg: 'from-emerald-500 to-teal-700',
    initials: 'ME',
    quote:
      '“Muy buena experiencia. Instructores expertos en TI, código actualizado y una plataforma intuitiva. Recomiendo los cursos de IINICIA sin dudarlo.”',
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* 1. HERO PRINCIPAL CON IMAGEN DE FONDO Y DISEÑO UNIVERSIDAD i²INICIA */}
      <div className="bg-[#e8f4fd]">
        <section className="relative overflow-hidden bg-[#111827] text-white py-24 lg:py-32 rounded-br-[90px] lg:rounded-br-[140px] shadow-xl">
          {/* Segunda imagen de fondo (estudiantes en laboratorio de cómputo) con zoom lento */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-hero-zoom"
            style={{ backgroundImage: "url('/hero-bg.png')" }}
          />
          {/* Capa oscura translúcida para resaltar el texto blanco como en el diseño de referencia */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/85 via-[#111827]/80 to-[#0f172a]/85"
          />
          {/* Orbes de luz flotantes en movimiento constante */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0066ff]/25 blur-3xl animate-float-slow"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#00b4d8]/20 blur-3xl animate-float-slower"
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-wider uppercase text-white drop-shadow-md animate-fade-up"
              style={{ animationDelay: '100ms' }}
            >
              UNIVERSIDAD{' '}
              <span className="inline-flex items-baseline">
                <span className="relative inline-block">
                  <span
                    className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 text-lg sm:text-2xl lg:text-3xl font-extrabold text-white animate-bob"
                    style={{ animationDelay: '700ms' }}
                  >
                    2
                  </span>
                  I
                </span>
                NICIA
              </span>
            </h1>

            <div
              className="space-y-2 max-w-3xl mx-auto text-sm sm:text-lg text-white/95 font-normal leading-relaxed drop-shadow animate-fade-up"
              style={{ animationDelay: '350ms' }}
            >
              <p>Tu educación comienza hoy, estés donde estés.</p>
              <p>
                El conocimiento que transforma tu vida está a tu alcance, en
                todo momento.
              </p>
            </div>

            <div
              className="pt-2 flex items-center justify-center animate-fade-up"
              style={{ animationDelay: '600ms' }}
            >
              <Link
                href="/registro"
                className="group relative overflow-hidden px-8 py-3 rounded-full bg-[#0066ff] hover:bg-blue-500 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider animate-pulse-glow transition hover:scale-105"
              >
                <span className="relative z-10">COMIENZA AHORA</span>
                <span
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"
                />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* CINTA TECNOLÓGICA EN MOVIMIENTO */}
      <div className="marquee-pausable relative hex-header-bg py-4 overflow-hidden border-y border-white/10">
        <div className="flex w-max animate-marquee">
          {[...TECH_TICKER, ...TECH_TICKER].map((tech, i) => (
            <span
              key={`${tech}-${i}`}
              className="flex items-center gap-3 px-6 text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-sky-100/90 whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-[#00b4d8] shadow-[0_0_8px_rgba(0,180,216,0.9)]" />
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* 2. FRANJA AZUL CLARO: "Todos nuestros cursos" */}
      <section className="bg-[#e8f4fd] py-10 px-4 border-b border-sky-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 text-center md:text-left">
          <Reveal variant="left" className="md:pr-8 md:border-r-2 md:border-[#0066ff] shrink-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Todos nuestros cursos
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-xs sm:text-sm text-slate-700 max-w-md leading-relaxed font-medium">
              Impulsa tu carrera en Tecnologías de la Información y Sistemas con
              cursos prácticos 100% enfocados en la industria del software.
            </p>
          </Reveal>

          <Reveal variant="right" delay={300} className="shrink-0">
            <Link
              href="/cursos"
              className="px-7 py-3 rounded-full bg-[#0066ff] hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition hover:scale-105 hover:shadow-lg"
            >
              VER TODOS LOS CURSOS
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 3. BANNER OSCURO DE 3 PILARES: Experiencia · Certificación · Evaluación */}
      <section className="relative bg-[#071026] text-white py-20 px-4 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#0066ff_0%,_transparent_65%)] animate-breathe"
        />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <Reveal className="h-full">
            <div className="space-y-4 px-4 h-full transition duration-300 hover:-translate-y-1.5">
              <h3 className="text-lg font-extrabold text-white tracking-wide">
                Experiencia Práctica en Código
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Transforma teoría en práctica desarrollando aplicaciones reales,
                configurando servidores, bases de datos y auditorías de seguridad.
              </p>
              <div className="pt-2">
                <Link
                  href="/registro"
                  className="inline-block px-6 py-2.5 rounded-full bg-[#0066ff] hover:bg-blue-500 text-white text-[11px] font-extrabold uppercase tracking-wider transition hover:scale-105"
                >
                  COMIENZA AHORA
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150} className="h-full">
            <div className="space-y-4 px-4 md:border-x md:border-slate-800 h-full transition duration-300 hover:-translate-y-1.5">
              <h3 className="text-lg font-extrabold text-white tracking-wide">
                Certificación en TI
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Obtén certificados digitales por cada curso de informática y
                sistemas completado, válidos para tu portafolio y perfil técnico.
              </p>
            </div>
          </Reveal>

          <Reveal delay={300} className="h-full">
            <div className="space-y-4 px-4 h-full transition duration-300 hover:-translate-y-1.5">
              <h3 className="text-lg font-extrabold text-white tracking-wide">
                Evaluación Continua 24/7
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Contenidos actualizados a los estándares de la industria
                tecnológica, impartidos por especialistas y disponibles 24/7 en
                Moodle.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. SECCIÓN: "¿POR QUÉ ELEGIRNOS?" */}
      <section className="bg-[#f4f5f7] py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <Reveal variant="left" className="lg:col-span-5">
            <div className="text-center space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                ¿POR QUÉ ELEGIRNOS?
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Especialistas en formación de Informática y Sistemas.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Diseñamos rutas de aprendizaje flexibles para desarrolladores,
                administradores de sistemas, analistas de datos y especialistas
                en seguridad informática. Aprende a tu ritmo desde cualquier
                lugar.
              </p>

              {/* Ilustración Vectorial Smartphone 5 Estrellas */}
              <div className="pt-4 flex justify-center">
                <div className="relative w-64 h-64 bg-white rounded-3xl border border-slate-200 shadow-lg flex flex-col items-center justify-center p-6 animate-bob">
                  <div className="w-28 h-44 rounded-2xl border-4 border-[#0066ff] bg-sky-50 flex flex-col items-center justify-between p-3 shadow-inner">
                    <div className="w-8 h-1 rounded-full bg-slate-300" />
                    <div className="text-3xl">👨‍💻</div>
                    <div className="w-full h-2 rounded bg-blue-200" />
                  </div>
                  <div
                    className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white border-2 border-amber-400 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-1 text-amber-400 text-base font-black animate-bob"
                    style={{ animationDelay: '1.2s' }}
                  >
                    ★ ★ ★ ★ ★
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-sky-100 text-[#0066ff] flex items-center justify-center text-lg shadow animate-spin-slow">
                    ⚙️
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-7 space-y-5">
            {WHY_CHOOSE_US.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-4 p-3.5 rounded-2xl hover:bg-white hover:shadow-md transition duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 rounded-full bg-[#0066ff] text-white flex items-center justify-center text-base shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0066ff] transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN: CATÁLOGO DE CURSOS DE INFORMÁTICA Y SISTEMAS */}
      <section className="bg-white py-20 px-4 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-10">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0066ff]">
                  Rama de Informática y Sistemas Computacionales
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                  Cursos Especializados en Tecnologías de la Información
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Explora el temario por módulos de nuestros 6 cursos troncales
                  en desarrollo web, ciberseguridad, IA, cloud, bases de datos y
                  redes.
                </p>
              </div>
              <Link
                href="/cursos"
                className="px-6 py-2.5 rounded-full bg-[#0066ff] hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider transition hover:scale-105 shrink-0"
              >
                Ver catálogo de cursos →
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {FALLBACK_PROGRAMS.map((program, i) => {
              const totalTopics =
                program.semesters?.reduce(
                  (acc, s) => acc + s.subjects.length,
                  0,
                ) || 0;

              return (
                <Reveal key={program.id} variant="zoom" delay={i * 100} className="h-full">
                  <article className="group h-full bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                        Free · {program.duration}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {program.code}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-[#0066ff] transition">
                      {program.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {program.summary}
                    </p>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 mb-5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-extrabold text-[#0066ff] uppercase tracking-wider text-[11px]">
                          Temario: {program.semesters.length} Módulos
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {totalTopics} temas prácticos
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {program.semesters.map((mod) => (
                          <li key={mod.semester} className="leading-snug">
                            <strong className="text-slate-900">
                              {mod.title}:
                            </strong>{' '}
                            <span className="text-slate-600">
                              {mod.subjects.slice(0, 2).join(', ')}...
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/oferta-academica/${program.slug}`}
                      className="flex-1 text-center py-2.5 rounded-lg bg-[#2b7de9] hover:bg-[#0066ff] text-white text-xs font-bold transition hover:scale-[1.02]"
                    >
                      Ver Módulos del Curso
                    </Link>
                    <Link
                      href="/registro"
                      className="px-4 py-2.5 rounded-lg border border-slate-300 hover:border-[#0066ff] text-slate-700 hover:text-[#0066ff] text-xs font-bold transition"
                    >
                      Inscribirme
                    </Link>
                  </div>
                </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SECCIÓN DE RESEÑAS Y CONFIANZA 4.8 ESTRELLAS */}
      <section className="bg-gradient-to-b from-[#e8f4fd] to-white py-20 px-4 border-t border-sky-100">
        <div className="max-w-5xl mx-auto space-y-14">
          <Reveal>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 max-w-md leading-tight">
                Contamos con la confianza de miles de estudiantes y tutores
              </h2>

              <div className="flex items-center gap-3 bg-white px-6 py-3.5 rounded-2xl shadow-sm border border-sky-100 transition duration-300 hover:shadow-md hover:-translate-y-0.5">
                <CountUp
                  to={4.8}
                  decimals={1}
                  duration={1800}
                  className="text-4xl font-black text-slate-900"
                />
                <div className="text-left">
                  <div className="text-[#0066ff] text-sm font-black tracking-widest">
                    ★★★★★
                  </div>
                  <div className="text-[11px] font-bold text-slate-700 leading-tight">
                    Google Reviews
                  </div>
                  <div className="text-[10px] text-slate-500">
                    <CountUp to={2384} duration={2000} /> valoraciones
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 pt-4">
            {TESTIMONIALS.map((item, i) => (
              <Reveal key={item.name} delay={i * 120} className="h-full">
                <div className="group relative h-full bg-white rounded-2xl p-7 pt-10 shadow-lg shadow-sky-900/5 border border-slate-100 flex flex-col justify-between transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <div
                    className={`absolute -top-6 left-6 w-12 h-12 rounded-xl bg-gradient-to-br ${item.avatarBg} text-white font-extrabold text-sm flex items-center justify-center shadow-md border-2 border-white transition duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                  >
                    {item.initials}
                  </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-4">
                  {item.quote}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {item.role}
                    </div>
                  </div>
                  <div className="text-[#0066ff] text-xs font-black tracking-widest">
                    ★★★★★
                  </div>
                </div>
                </div>
                </Reveal>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
