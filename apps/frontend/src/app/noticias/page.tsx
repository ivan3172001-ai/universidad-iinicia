import React from 'react';
import Reveal from '../../components/Reveal';

export default function NoticiasPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 overflow-hidden">
      <Reveal variant="left">
        <header>
          <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
            Actualidad Universitaria · IINICIA
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-1">
            Noticias y Contenidos Institucionales
          </h1>
        </header>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tarjeta 1: Suspensión de labores el 2 de noviembre */}
        <Reveal variant="zoom" delay={0} className="h-full">
          <article className="group card-hover-3d relative h-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[290px] overflow-hidden">
            <div className="space-y-3 z-10 pr-10">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold text-iinicia-primary">
                  Aviso Importante
                </span>
                <time>27 de octubre de 2026</time>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-[#0066ff] transition">
                Suspensión de labores el 2 de noviembre
              </h2>
              <p className="text-sm text-slate-800 leading-relaxed">
                Se les informa a toda la comunidad estudiantil y académica que el
                próximo{' '}
                <strong className="font-bold text-slate-950">
                  lunes 2 de noviembre no habrá clases
                </strong>
                , con motivo de las festividades del{' '}
                <strong className="font-bold text-slate-950">
                  Día de Muertos
                </strong>
                . Las actividades se reanudarán de manera normal al día siguiente.
              </p>
            </div>

            <div
              aria-hidden="true"
              className="absolute bottom-3 right-4 flex flex-col items-center gap-1 select-none animate-bob"
            >
              <span className="text-3xl leading-none drop-shadow-sm">🗓️</span>
              <span className="text-4xl leading-none drop-shadow-sm">💀</span>
            </div>
          </article>
        </Reveal>

        {/* Tarjeta 2: ¡Llega la Gran Carrera de Botargas Universitarias! */}
        <Reveal variant="zoom" delay={120} className="h-full">
          <article className="group card-hover-3d relative h-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[290px] overflow-hidden">
            <div className="space-y-3 z-10 pr-8">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold text-iinicia-primary">
                  Eventos Universitarios
                </span>
                <time>26 de octubre de 2026</time>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-[#0066ff] transition">
                ¡Llega la Gran Carrera de Botargas IINICIA!
              </h2>
              <p className="text-sm text-slate-800 leading-relaxed">
                La cita es el 30 de octubre a las 11:00 hrs. Ven a apoyar a la
                botarga de tu especialidad en este divertido circuito. ¡No te
                pierdas las sorpresas y el gran ambiente universitario!
              </p>
            </div>

            <div
              aria-hidden="true"
              className="absolute bottom-3 right-4 flex items-center select-none animate-bob"
              style={{ animationDelay: '600ms' }}
            >
              <span className="text-5xl leading-none drop-shadow-sm">🤹‍♂️</span>
            </div>
          </article>
        </Reveal>

        {/* Tarjeta 3: Concurso de Ofrendas por Edificio */}
        <Reveal variant="zoom" delay={240} className="h-full">
          <article className="group card-hover-3d relative h-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[290px] overflow-hidden">
            <div className="space-y-3 z-10 pr-8">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold text-iinicia-primary">
                  Tradiciones
                </span>
                <time>24 de octubre de 2026</time>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-[#0066ff] transition">
                Concurso de Ofrendas por Edificio
              </h2>
              <p className="text-sm text-slate-800 leading-relaxed">
                Se convoca a toda la comunidad a participar en el tradicional
                concurso de ofrendas de Día de Muertos. Cada edificio mostrará su
                creatividad y tradición. Consulta las bases con tus jefes de
                división.
              </p>
            </div>

            <div
              aria-hidden="true"
              className="absolute bottom-3 right-4 flex flex-col items-center select-none animate-bob"
              style={{ animationDelay: '1200ms' }}
            >
              <div className="flex items-end gap-0.5 text-xl leading-none">
                <span>🕯️</span>
                <span>🖼️</span>
                <span>🕯️</span>
              </div>
              <div className="text-lg leading-none -mt-1">🌼🏵️🌼</div>
            </div>
          </article>
        </Reveal>
      </div>
    </div>
  );
}
