'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { PendingLoginSession, useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  buildOtpAuthUri,
  getOrCreateTotpSecret,
  isTotpEnrolled,
  markTotpEnrolled,
  verifyTotpCode,
} from '../../lib/totp';

export default function LoginPage() {
  const router = useRouter();
  const { verifyCredentialsFor2FA, finalizeLoginSession } = useAuth();

  const [step, setStep] = useState<'credentials' | 'authenticator'>(
    'credentials',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [showQrSetup, setShowQrSetup] = useState(false);
  const [pendingSession, setPendingSession] =
    useState<PendingLoginSession | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Paso 1: Verifica correo y contraseña y pasa al reto de Google Authenticator.
   */
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const pending = await verifyCredentialsFor2FA(normalizedEmail, password);
      const secret = getOrCreateTotpSecret(normalizedEmail);
      const alreadyEnrolled = isTotpEnrolled(normalizedEmail);

      setPendingSession(pending);
      setTotpSecret(secret);
      setShowQrSetup(!alreadyEnrolled);
      setOtpCode('');
      setStep('authenticator');
    } catch (err: any) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Paso 2: Verifica el código de 6 dígitos generado por la app Google Authenticator.
   */
  const handleVerifyAuthenticator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingSession) return;

    setError(null);
    setLoading(true);
    try {
      const cleanCode = otpCode.replace(/\s+/g, '');
      let isValid = await verifyTotpCode(totpSecret, cleanCode);

      // Si también tiene un factor MFA nativo en Supabase, permitir validarlo ahí
      if (!isValid && pendingSession.supabaseFactorId) {
        const { error: mfaErr } = await supabase.auth.mfa.challengeAndVerify({
          factorId: pendingSession.supabaseFactorId,
          code: cleanCode,
        });
        if (!mfaErr) {
          isValid = true;
        }
      }

      if (!isValid) {
        throw new Error(
          'Código incorrecto o expirado. Abre tu app Google Authenticator e ingresa el código actual de 6 dígitos.',
        );
      }

      markTotpEnrolled(email);
      const loggedUser = finalizeLoginSession(pendingSession);

      if (
        loggedUser.roles.includes('admin') ||
        loggedUser.roles.includes('superadmin')
      ) {
        router.push('/admin');
      } else {
        router.push('/mi-iinicia');
      }
    } catch (err: any) {
      setError(
        err.message ||
          'El código de 6 dígitos de Google Authenticator no es válido.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (!totpSecret || typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const otpAuthUri =
    email && totpSecret ? buildOtpAuthUri(email, totpSecret) : '';
  const qrImageUrl = otpAuthUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(
        otpAuthUri,
      )}`
    : '';

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
          Login · Acceso con Verificación de Google Authenticator (2FA)
        </div>

        <div className="card-hover-3d max-w-md mx-auto bg-white rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.1)] border border-slate-100 p-8 space-y-6">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/iinicia-logo.png"
              alt="Logo IINICIA"
              width={36}
              height={36}
              style={{ width: '36px', height: '36px' }}
              className="rounded-lg bg-white p-1 border border-slate-200 object-contain shadow-sm shrink-0"
            />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0066ff]">
                UNIVERSIDAD i² INICIA
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {step === 'credentials'
                  ? 'Iniciar Sesión'
                  : 'Google Authenticator'}
              </h1>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
            >
              {error}
            </div>
          )}

          {step === 'credentials' ? (
            <>
              <p className="text-xs sm:text-sm text-center text-slate-600">
                Ingresa tu correo y contraseña. En el siguiente paso validarás tu
                acceso con el código de 6 dígitos de{' '}
                <strong className="text-slate-800">Google Authenticator</strong>.
              </p>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
                    placeholder="usuario@iinicia.edu.mx"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-slate-700"
                    >
                      Contraseña
                    </label>
                    <Link
                      href="/recuperar-acceso"
                      className="text-xs font-semibold text-[#0066ff] hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-extrabold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] hover:opacity-95 shadow-md transition disabled:opacity-50"
                >
                  {loading
                    ? 'VALIDANDO CREDENCIALES...'
                    : 'CONTINUAR A GOOGLE AUTHENTICATOR'}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-slate-700 space-y-1">
                <div className="font-extrabold text-[#0066ff] uppercase tracking-wide">
                  🔒 Verificación en 2 pasos (Google Authenticator)
                </div>
                <p>
                  Cuenta: <strong className="text-slate-900">{email}</strong>
                </p>
                <p className="text-slate-600">
                  Abre la app <strong>Google Authenticator</strong> en tu
                  celular e introduce el código temporal de 6 dígitos.
                </p>
              </div>

              {/* Botón para mostrar/ocultar QR de vinculación */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowQrSetup((prev) => !prev)}
                  className="text-xs font-bold text-[#0066ff] hover:underline"
                >
                  {showQrSetup
                    ? '▲ Ocultar código QR de configuración'
                    : '📱 ¿Primera vez? Escanear código QR en Google Authenticator'}
                </button>
              </div>

              {showQrSetup && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center">
                  <p className="text-xs text-slate-700 font-medium">
                    1. Abre <strong>Google Authenticator</strong> en tu teléfono
                    y pulsa <strong>+ → Escanear un código QR</strong>:
                  </p>
                  {qrImageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={qrImageUrl}
                        alt="Código QR para Google Authenticator"
                        width={180}
                        height={180}
                        className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
                      />
                    </div>
                  )}
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] text-slate-500">
                      O ingresa manualmente esta clave secreta (Base32):
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-mono text-xs font-extrabold tracking-widest text-slate-900">
                        {totpSecret}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition"
                      >
                        {copiedSecret ? '¡Copiada!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyAuthenticator} className="space-y-4">
                <div>
                  <label
                    htmlFor="totp-code"
                    className="block text-xs font-bold text-slate-700 mb-1.5 text-center"
                  >
                    Código de 6 dígitos de Google Authenticator
                  </label>
                  <input
                    id="totp-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/[^0-9]/g, ''))
                    }
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-center font-mono text-2xl font-black tracking-[0.4em] text-slate-900 focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 rounded-lg font-extrabold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] hover:opacity-95 shadow-md transition disabled:opacity-50"
                >
                  {loading
                    ? 'VERIFICANDO CÓDIGO...'
                    : 'VALIDAR CÓDIGO E INGRESAR AL PORTAL'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials');
                    setError(null);
                    setOtpCode('');
                  }}
                  className="w-full py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  ← Volver a correo y contraseña
                </button>
              </form>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
            ¿Aún no tienes cuenta?{' '}
            <span aria-hidden="true" className="mr-1">
              👉
            </span>
            <Link
              href="/registro"
              className="font-bold text-[#0066ff] hover:underline"
            >
              Crear Cuenta aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
