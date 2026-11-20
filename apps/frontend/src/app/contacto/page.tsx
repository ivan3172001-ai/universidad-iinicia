'use client';

import React, { useState } from 'react';

export default function ContactoPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <header>
        <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
          Atención Universitaria · UNIVERSIDAD i² INICIA
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1">
          Contacto y Soporte Académico
        </h1>
        <p className="text-slate-600 mt-2">
          Comunícate con nuestra mesa de admisiones, coordinación académica o
          soporte técnico del Campus Moodle.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h2 className="text-xl font-bold text-slate-900">
            Canales de Atención Oficial
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div>
              <strong className="text-slate-900 block">
                Admisiones y Control Escolar:
              </strong>
              admisiones@iinicia.edu.mx
            </div>
            <div>
              <strong className="text-slate-900 block">
                Soporte Técnico Campus Moodle:
              </strong>
              soporte@iinicia.edu.mx
            </div>
            <div>
              <strong className="text-slate-900 block">
                Horario de atención:
              </strong>
              Lunes a viernes de 08:00 a 20:00 h (Tiempo del Centro de México)
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900">
            Envíanos un mensaje
          </h2>

          {sent ? (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium"
            >
              ✔ Tu mensaje ha sido recibido por el equipo de soporte de
              IINICIA. Te responderemos a la brevedad.
            </div>
          ) : (
            <>
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Nombre completo
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
                  placeholder="Tu nombre y apellidos"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Correo electrónico
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Mensaje o consulta
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
                  placeholder="Describe tu consulta sobre admisiones, cursos o acceso al campus..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold bg-iinicia-primary text-white hover:bg-teal-900 transition text-sm"
              >
                Enviar mensaje
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
