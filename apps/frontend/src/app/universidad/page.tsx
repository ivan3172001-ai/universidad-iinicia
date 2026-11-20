import React from 'react';

export default function UniversidadPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
      <header className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
          UNIVERSIDAD i² INICIA
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1">
          Instituto de Innovación y Ciencias Aplicadas (IINICIA)
        </h1>
        <p className="text-lg text-slate-600 mt-3 leading-relaxed">
          UNIVERSIDAD i² INICIA es una institución de educación superior
          tecnológica especializada en cursos, certificaciones y diplomados de
          la rama de Informática, Desarrollo de Software, Ciberseguridad,
          Inteligencia Artificial, Cloud Computing y Sistemas Computacionales.
        </p>
      </header>

      {/* Quiénes Somos, Misión y Visión */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-iinicia-navy mb-2">
            Quiénes Somos
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Somos una comunidad universitaria enfocada en el desarrollo de
            competencias profesionales en informática, sistemas y tecnología,
            integrando acompañamiento docente personalizado y laboratorios
            virtuales.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-iinicia-navy mb-2">Misión</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Formar profesionales éticos, críticos y altamente competentes mediante
            programas académicos actualizados y una plataforma educativa digital
            accesible, segura y centrada en el estudiante.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-iinicia-navy mb-2">Visión</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Consolidarnos como referente en educación superior digital en
            Iberoamérica, destacando por la calidad pedagógica de nuestros cursos
            y la integración tecnológica entre el portal institucional y nuestro
            Campus Virtual.
          </p>
        </div>
      </section>

      {/* Modelo Educativo */}
      <section className="bg-gradient-to-r from-iinicia-navy to-iinicia-primary text-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-extrabold mb-4">
          Modelo Educativo Universitario (Portal + Moodle LMS)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-100">
          <div className="bg-white/10 rounded-xl p-4 border border-white/15">
            <h3 className="font-bold text-teal-300 text-base mb-1">
              1. Aprendizaje Basado en Proyectos
            </h3>
            <p>
              Cada curso en Moodle integra recursos teóricos, actividades
              prácticas entregables, foros de discusión y evaluaciones con
              retroalimentación docente.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-white/15">
            <h3 className="font-bold text-teal-300 text-base mb-1">
              2. Seguimiento y Finalización
            </h3>
            <p>
              Trazabilidad completa del avance académico mediante criterios de
              finalización de actividad y finalización de curso dentro del LMS.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-white/15">
            <h3 className="font-bold text-teal-300 text-base mb-1">
              3. Experiencia Digital Única
            </h3>
            <p>
              Desde el registro como aspirante hasta la certificación, el
              estudiante gestiona su trayectoria en Mi IINICIA y accede de forma
              transparente a sus aulas virtuales.
            </p>
          </div>
        </div>
      </section>

      {/* Autoridades y Cuerpo Docente */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
          Autoridades Académicas y Cuerpo Docente
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <span className="text-xs font-bold uppercase text-iinicia-primary">
              Dirección Académica y Administración
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Mtra. Elena Vargas
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Coordinación General de Admisiones, Programas y Control Escolar
              (admin@iinicia.edu.mx)
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <span className="text-xs font-bold uppercase text-iinicia-primary">
              Claustro Docente · Informática y Sistemas
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Ing. Roberto Méndez
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Profesor Titular de Introducción a las TI (TI-101) y Desarrollo Web
              con React (WEB-202) en Campus Moodle (profesor@iinicia.edu.mx)
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <span className="text-xs font-bold uppercase text-iinicia-primary">
              Coordinación de Innovación Educativa
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Dr. Alejandro Morales
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Diseño Instruccional, Calidad Curricular y Evaluación en Campus
              Virtual Moodle.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
