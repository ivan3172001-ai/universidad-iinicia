import type { Metadata } from 'next';
import React from 'react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'UNIVERSIDAD i² INICIA | Cursos de Informática y Sistemas',
  description:
    'Portal oficial de UNIVERSIDAD i² INICIA · Instituto de Innovación y Ciencias Aplicadas: Cursos, Certificaciones y Diplomados en Informática, Desarrollo Web, Ciberseguridad, IA, Cloud y Sistemas.',
  icons: {
    icon: '/iinicia-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main id="contenido-principal" className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
