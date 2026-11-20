'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { supabase } from '../lib/supabase';

export type RoleCode =
  | 'superadmin'
  | 'admin'
  | 'coordinador'
  | 'profesor'
  | 'estudiante'
  | 'aspirante'
  | 'soporte';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: 'pendiente' | 'activo' | 'suspendido' | 'inactivo';
  moodle_user_id: number | null;
  moodle_sync_status: string;
  moodle_last_sync_at: string | null;
  created_at: string;
}

export interface AuthUser {
  profile: UserProfile;
  roles: RoleCode[];
  primaryRole: RoleCode;
}

export interface PendingLoginSession {
  accessToken: string;
  user: AuthUser;
  supabaseFactorId?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  verifyCredentialsFor2FA: (
    email: string,
    password?: string,
  ) => Promise<PendingLoginSession>;
  finalizeLoginSession: (pending: PendingLoginSession) => AuthUser;
  loginWithEmail: (email: string, password?: string) => Promise<AuthUser>;
  registerUser: (payload: {
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    phone?: string;
    interested_program_id?: string;
  }) => Promise<AuthUser>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_TOKEN_KEY = 'iinicia_portal_access_token';

const DEMO_EMAILS = new Set([
  'ivan3172001@gmail.com',
  'negromante.ba@gmail.com',
  'urielgonzalezvargas25@gmail.com',
  'admin@iinicia.edu.mx',
  'profesor@iinicia.edu.mx',
  'estudiante1@iinicia.edu.mx',
  'estudiante2@iinicia.edu.mx',
  'aspirante@iinicia.edu.mx',
]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const savedToken =
          typeof window !== 'undefined'
            ? window.localStorage.getItem(STORAGE_TOKEN_KEY)
            : null;

        if (!savedToken) {
          if (mounted) setLoading(false);
          return;
        }

        setAccessToken(savedToken);
        const res = await apiRequest<{ user: AuthUser }>(
          '/auth/me',
          {},
          savedToken,
        );
        if (mounted) setUser(res.user);
      } catch {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_TOKEN_KEY);
        }
        if (mounted) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Paso 1 del Login: Valida correo y contraseña sin activar todavía la sesión en el portal,
   * para exigir el código de 6 dígitos de Google Authenticator en el Paso 2.
   */
  const verifyCredentialsFor2FA = async (
    email: string,
    password?: string,
  ): Promise<PendingLoginSession> => {
    const normalizedEmail = email.trim().toLowerCase();
    let supabaseFactorId: string | undefined;

    if (!DEMO_EMAILS.has(normalizedEmail) && password) {
      const { data: sbData, error: sbError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      // Si Supabase tiene el usuario y la contraseña es la que registró localmente en el backend,
      // verificamos si el error es solo por falta de confirmación de correo en el plan gratuito.
      if (sbError) {
        const msg = sbError.message.toLowerCase();
        const isEmailNotConfirmed = msg.includes('email not confirmed');
        if (!isEmailNotConfirmed) {
          // Intentar validar contra el backend local por si fue creado antes
          try {
            const fallbackRes = await apiRequest<{
              accessToken: string;
              user: AuthUser;
            }>('/auth/login', {
              method: 'POST',
              body: JSON.stringify({ email: normalizedEmail, password }),
            });
            return {
              accessToken: fallbackRes.accessToken,
              user: fallbackRes.user,
            };
          } catch {
            throw new Error(
              'Correo electrónico o contraseña incorrectos. Verifica tus datos.',
            );
          }
        }
      } else if (sbData?.user) {
        try {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const verifiedTotp = factors?.totp?.find(
            (f) => f.status === 'verified',
          );
          if (verifiedTotp) {
            supabaseFactorId = verifiedTotp.id;
          }
        } catch {
          // Continuar con validación TOTP RFC 6238 estándar
        }
      }
    }

    let res: { accessToken: string; user: AuthUser };
    try {
      res = await apiRequest<{ accessToken: string; user: AuthUser }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email: normalizedEmail, password }),
        },
      );
    } catch {
      const { data: sbUser } = await supabase.auth.getUser();
      const meta = sbUser?.user?.user_metadata || {};
      res = await apiRequest<{ accessToken: string; user: AuthUser }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            email: normalizedEmail,
            first_name: meta.first_name || normalizedEmail.split('@')[0],
            last_name: meta.last_name || 'IINICIA',
            phone: meta.phone || '',
          }),
        },
      );
    }

    return {
      accessToken: res.accessToken,
      user: res.user,
      supabaseFactorId,
    };
  };

  /**
   * Paso 2 del Login: Activa la sesión únicamente después de validar el código
   * de 6 dígitos de Google Authenticator.
   */
  const finalizeLoginSession = (pending: PendingLoginSession): AuthUser => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_TOKEN_KEY, pending.accessToken);
    }
    setAccessToken(pending.accessToken);
    setUser(pending.user);
    return pending.user;
  };

  const loginWithEmail = async (email: string, password?: string) => {
    const pending = await verifyCredentialsFor2FA(email, password);
    return finalizeLoginSession(pending);
  };

  const registerUser = async (payload: {
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    phone?: string;
    interested_program_id?: string;
  }): Promise<AuthUser> => {
    const normalizedEmail = payload.email.trim().toLowerCase();

    if (payload.password) {
      await supabase.auth
        .signUp({
          email: normalizedEmail,
          password: payload.password,
          options: {
            data: {
              first_name: payload.first_name,
              last_name: payload.last_name,
              phone: payload.phone || '',
            },
          },
        })
        .catch(() => {});
    }

    const res = await apiRequest<{ accessToken: string; user: AuthUser }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    return res.user;
  };

  const refreshUser = async () => {
    if (!accessToken) return;
    const res = await apiRequest<{ user: AuthUser }>('/auth/me', {}, accessToken);
    setUser(res.user);
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        verifyCredentialsFor2FA,
        finalizeLoginSession,
        loginWithEmail,
        registerUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return ctx;
}
