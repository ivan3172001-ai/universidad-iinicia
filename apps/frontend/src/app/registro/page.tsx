'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FALLBACK_PROGRAMS } from '../../lib/api';

export default function RegistroPage() {
  const router = useRouter();
  const { registerUser } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [programId, setProgramId] = useState(FALLBACK_PROGRAMS[0].id);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) {
      return {
        label: '—',
        color: 'text-slate-400',
        barWidth: 'w-0',
        barColor: 'bg-slate-200',
      };
    }
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        label: 'Débil',
        color: 'text-rose-600 font-bold',
        barWidth: 'w-1/3',
        barColor: 'bg-rose-500',
      };
    }
    if (score <= 3) {
      return {
        label: 'Media',
        color: 'text-amber-600 font-bold',
        barWidth: 'w-2/3',
        barColor: 'bg-amber-500',
      };
    }
    return {
      label: 'Fuerte',
      color: 'text-emerald-600 font-bold',
      barWidth: 'w-full',
      barColor: 'bg-emerald-500',
    };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    const parts = username.trim().split(/\s+/);
    const firstName = parts[0] || 'Usuario';
    const lastName = parts.slice(1).join(' ') || 'IINICIA';

    setSubmitting(true);
    try {
      await registerUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
        interested_program_id: programId,
      });
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'No fue posible completar el registro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative bg-[#e8f4fd] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0066ff]/15 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#00b4d8]/15 blur-3xl animate-float-slower"
      />

      <div className="relative max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-sky-100 px-6 sm:px-12 py-12 space-y-10 animate-fade-up">
        <div className="text-sm font-bold text-slate-800">
          Registration · Registro de Usuario
        </div>

        <div className="card-hover-3d max-w-md mx-auto bg-white rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.1)] border border-slate-100 p-8 space-y-5">
          <div className="flex items-center justify-center gap-3 pb-2">
            <span className="text-3xl select-none" aria-hidden="true">
              🧾
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Crear Cuenta
            </h1>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reg-username"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Nombre de usuario / Nombre completo
              </label>
              <input
                id="reg-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. Mariana Torres"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mariana@ejemplo.com"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
              />
            </div>

            <div>
              <label
                htmlFor="reg-program"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Curso de Informática y Sistemas de interés
              </label>
              <select
                id="reg-program"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
              >
                {FALLBACK_PROGRAMS.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.title} ({prog.duration})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Teléfono (opcional)
              </label>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
              />
              <div className="mt-2 space-y-1">
                <div className="text-xs text-slate-500">
                  Seguridad:{' '}
                  <span className={passwordStrength.color}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.barWidth} ${passwordStrength.barColor}`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-extrabold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] hover:opacity-95 shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'REGISTRANDO CUENTA...' : 'REGISTRARME'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-600 pt-1">
            ¿Ya tienes cuenta?{' '}
            <span aria-hidden="true" className="mr-1">
              👉
            </span>
            <Link
              href="/login"
              className="font-bold text-[#0066ff] hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-4">
          ¿Te apasiona la enseñanza? Conviértete en docente o instructor.{' '}
          <Link
            href="/contacto"
            className="font-bold text-[#0066ff] hover:underline"
          >
            ¡Haz clic aquí!
          </Link>
        </div>
      </div>
    </div>
  );
}
