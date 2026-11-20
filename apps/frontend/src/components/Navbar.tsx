'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IiniciaLogo } from './IiniciaLogo';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStaff =
    user &&
    user.roles.some((r) =>
      ['superadmin', 'admin', 'coordinador', 'soporte'].includes(r),
    );

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/cursos', label: 'Cursos' },
    { href: '/certificaciones', label: 'Certificaciones' },
    { href: '/diplomados', label: 'Diplomados' },
    { href: '/oferta-academica', label: 'Universidad IINICIA' },
    { href: '/noticias', label: 'Noticias' },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 hex-header-bg text-white border-b border-slate-800/80 shadow-lg">
      {/* Enlace de accesibilidad por teclado WCAG 2.2 AA */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-slate-950 focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold"
      >
        Saltar al contenido principal
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28">
          {/* Logo i² INICIA */}
          <Link
            href="/"
            className="group flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-lg py-1 transition-transform duration-300 hover:scale-105"
          >
            <IiniciaLogo variant="dark" size="md" />
          </Link>

          {/* Menú de Navegación Escritorio con subrayado animado y destello */}
          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center gap-6"
          >
            {navItems.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link-animated text-sm font-semibold tracking-wide py-1.5 ${
                    active
                      ? 'text-sky-400 is-active'
                      : 'text-slate-100 hover:text-sky-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
                <Link
                  href="/mi-iinicia"
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 ${
                    pathname === '/mi-iinicia'
                      ? 'bg-[#0066ff] text-white shadow-md shadow-blue-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Mi IINICIA ({user.primaryRole.toUpperCase()})
                </Link>

                {isStaff && (
                  <Link
                    href="/admin"
                    className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all duration-300 hover:scale-105 ${
                      pathname === '/admin'
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                        : 'border-sky-400/60 text-sky-300 hover:bg-white/10'
                    }`}
                  >
                    Panel Admin
                  </Link>
                )}

                <Link
                  href="/perfil"
                  className="nav-link-animated text-xs font-medium text-slate-300 hover:text-white py-1"
                >
                  Mi Perfil
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all duration-300 hover:scale-105"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-5 pl-2">
                <Link
                  href="/registro"
                  className={`nav-link-animated text-sm font-semibold py-1.5 ${
                    pathname === '/registro'
                      ? 'text-sky-400 is-active'
                      : 'text-slate-100 hover:text-sky-300'
                  }`}
                >
                  Regístrate
                </Link>
                <Link
                  href="/login"
                  className="group relative overflow-hidden px-5 py-2 rounded-full text-sm font-bold bg-[#0066ff] hover:bg-blue-500 text-white shadow-md animate-pulse-glow transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10">Iniciar Sesión</span>
                  <span
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"
                  />
                </Link>
              </div>
            )}
          </nav>

          {/* Botón Menú Móvil */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menú de navegación"
              className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <span className="text-sm font-bold">
                {mobileMenuOpen ? '✕ Cerrar' : '☰ Menú'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#050c21] border-t border-slate-800 px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-100 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/mi-iinicia"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-full font-bold bg-[#0066ff] text-white"
                >
                  Mi IINICIA ({user.primaryRole.toUpperCase()})
                </Link>
                {isStaff && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center px-4 py-2 rounded-full font-semibold border border-sky-400 text-sky-300"
                  >
                    Panel Administrativo
                  </Link>
                )}
                <Link
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10"
                >
                  Mi Perfil ({user.profile.email})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 rounded-full text-sm font-semibold bg-rose-600 text-white"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/registro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-full font-semibold border border-white/25 text-white"
                >
                  Regístrate
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-full font-bold bg-[#0066ff] text-white"
                >
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
