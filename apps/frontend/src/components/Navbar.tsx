'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { IiniciaLogo } from './IiniciaLogo';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

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
        <div className="flex flex-nowrap items-center justify-between gap-4 sm:gap-6 py-2.5">
          {/* Logo i² INICIA */}
          <Link
            href="/"
            className="group flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-lg py-1 transition-transform duration-300 hover:scale-105 shrink-0"
          >
            <IiniciaLogo variant="dark" size="md" />
          </Link>

          {/* Menú de Navegación SIEMPRE al mismo nivel que el logo */}
          <nav
            aria-label="Navegación principal"
            className="flex flex-1 flex-wrap items-center justify-end gap-x-3.5 sm:gap-x-5 gap-y-2"
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
                  className={`nav-link-animated text-sm font-semibold tracking-wide py-1.5 whitespace-nowrap ${
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
              <div className="flex flex-wrap items-center gap-3 pl-3 border-l border-slate-700">
                <Link
                  href="/mi-iinicia"
                  className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 hover:scale-105 ${
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
                    className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-300 hover:scale-105 ${
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
                  className="nav-link-animated text-xs font-medium text-slate-300 hover:text-white py-1 whitespace-nowrap"
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
                  className={`nav-link-animated text-sm font-semibold py-1.5 whitespace-nowrap ${
                    pathname === '/registro'
                      ? 'text-sky-400 is-active'
                      : 'text-slate-100 hover:text-sky-300'
                  }`}
                >
                  Regístrate
                </Link>
                <Link
                  href="/login"
                  className="group relative overflow-hidden px-5 py-2 rounded-full text-sm font-bold bg-[#0066ff] hover:bg-blue-500 text-white shadow-md animate-pulse-glow transition-all duration-300 hover:scale-105 whitespace-nowrap"
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
        </div>
      </div>
    </header>
  );
}
