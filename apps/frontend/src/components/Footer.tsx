'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { IiniciaLogo } from './IiniciaLogo';

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <footer className="mt-auto">
      {/* Sección Pre-Footer: "Únete a nuestra comunidad" (Capturas 1, 3, 4, 5) */}
      <section className="bg-[#f2f3f5] border-t border-slate-200 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Únete a nuestra comunidad
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Introduzca su dirección de correo electrónico para obtener ofertas y
            convocatorias académicas de nuestra plataforma.
          </p>

          {subscribed ? (
            <div
              role="status"
              className="inline-block px-6 py-3 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-sm font-bold"
            >
              ✔ ¡Gracias por suscribirte a la comunidad de Universidad IINICIA!
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#0066ff] hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition"
              >
                SUSCRIBIRME
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Pie de Página Principal Limpio (Capturas 1, 3, 4, 5) */}
      <div className="bg-[#f8f9fa] border-t border-slate-200 text-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            {/* Columna Izquierda: Logo + Frase + Redes Sociales */}
            <div className="md:col-span-5 space-y-5">
              <div className="inline-block bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <IiniciaLogo variant="light" size="md" />
              </div>

              <p className="text-sm text-slate-600 leading-relaxed max-w-sm border-t border-slate-200 pt-4">
                Tu educación comienza hoy, estés donde estés. El conocimiento
                que transforma tu vida está a tu alcance, en todo momento.
              </p>

              {/* Íconos de Redes Sociales */}
              <div className="flex items-center gap-3 pt-1">
                {[
                  { label: 'Facebook', icon: 'f', href: '#' },
                  { label: 'Twitter / X', icon: '𝕏', href: '#' },
                  { label: 'Instagram', icon: '◎', href: '#' },
                  { label: 'YouTube', icon: '▶', href: '#' },
                ].map((soc) => (
                  <a
                    key={soc.label}
                    href={soc.href}
                    aria-label={soc.label}
                    className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#0066ff] text-white flex items-center justify-center text-xs font-bold transition"
                  >
                    {soc.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Columna Central: Navegación Rápida */}
            <div className="md:col-span-4 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                Oferta y Plataforma
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link
                    href="/oferta-academica"
                    className="hover:text-[#0066ff] transition"
                  >
                    Universidad IINICIA (Informática y Sistemas)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cursos"
                    className="hover:text-[#0066ff] transition"
                  >
                    Cursos Especializados
                  </Link>
                </li>
                <li>
                  <Link
                    href="/certificaciones"
                    className="hover:text-[#0066ff] transition"
                  >
                    Certificaciones Universitarias
                  </Link>
                </li>
                <li>
                  <Link
                    href="/diplomados"
                    className="hover:text-[#0066ff] transition"
                  >
                    Diplomados Online
                  </Link>
                </li>
                <li>
                  <Link
                    href="/noticias"
                    className="hover:text-[#0066ff] transition"
                  >
                    Noticias y Eventos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admisiones"
                    className="hover:text-[#0066ff] transition"
                  >
                    Proceso de Admisiones
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna Derecha: Contact Info */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                Contact Info
              </h3>
              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <div>
                  <strong className="block text-slate-900 font-bold">
                    Dirección
                  </strong>
                  Campus Digital y Sede Académica IINICIA · Ciudad de México
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">
                    Teléfono
                  </strong>
                  +52 (55) 5000 2300
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">
                    Email
                  </strong>
                  contacto@iinicia.edu.mx
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>Copyright © 2026 IINICIA</p>
            <p>Powered by IINICIA</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
