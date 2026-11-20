import Link from 'next/link';
import React from 'react';

export default function AdmisionesPage() {
  const steps = [
    {
      step: 'Paso 1',
      title: 'Registro en el Portal Universitario IINICIA (/registro)',
      desc: 'Capturas tus datos personales y correo electrónico. Supabase Auth genera tu identidad segura y el sistema crea tu perfil con el rol inicial de Aspirante.',
    },
    {
      step: 'Paso 2',
      title: 'Validación y Asignación de Rol Estudiante',
      desc: 'El equipo administrativo de Universidad IINICIA revisa tu solicitud, valida tu expediente y actualiza tu rol a Estudiante asociándote a tu programa o curso de Informática y Sistemas.',
    },
    {
      step: 'Paso 3',
      title: 'Sincronización Servidor-a-Servidor con Moodle',
      desc: 'El backend NestJS verifica o crea tu cuenta en Moodle sin duplicados, almacena tu moodle_user_id y genera tu matrícula únicamente en los cursos autorizados.',
    },
    {
      step: 'Paso 4',
      title: 'Acceso al Campus desde Mi IINICIA',
      desc: 'Ingresas a tu panel personalizado Mi IINICIA, consultas tus asignaturas matriculadas y accedes al Campus Moodle con un clic mediante sesión segura.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <header className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
          UNIVERSIDAD i² INICIA · Admisiones e Inscripción
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1">
          Proceso de Admisiones e Inscripción Universitaria
        </h1>
        <p className="text-slate-600 mt-3 leading-relaxed">
          Conoce el proceso paso a paso desde tu registro inicial como Aspirante
          hasta tu incorporación como Estudiante activo en el Campus Virtual
          Moodle de Universidad IINICIA.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((item) => (
          <div
            key={item.step}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2"
          >
            <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-sky-50 text-iinicia-primary border border-sky-200">
              {item.step}
            </span>
            <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-iinicia-navy text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">
            ¿Listo para iniciar tu proceso de admisión?
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Completa tu registro en línea en menos de 2 minutos.
          </p>
        </div>
        <Link
          href="/registro"
          className="px-6 py-3.5 rounded-xl font-bold bg-iinicia-primary text-white hover:bg-blue-500 transition shrink-0"
        >
          Ir al Formulario de Registro →
        </Link>
      </div>
    </div>
  );
}
