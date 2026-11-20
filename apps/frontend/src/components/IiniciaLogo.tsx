import React from 'react';

export function IiniciaLogo({
  variant = 'dark',
  size = 'md',
}: {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}) {
  const isDark = variant === 'dark';
  const pxSize = size === 'lg' ? 108 : size === 'sm' ? 52 : 84;

  return (
    <div className="inline-flex items-center justify-center select-none">
      <img
        src={isDark ? '/iinicia-logo-dark.png' : '/iinicia-logo.png'}
        alt="i² INICIA · Instituto de Innovación y Ciencias Aplicadas"
        width={pxSize}
        height={pxSize}
        style={{ height: `${pxSize}px`, width: 'auto' }}
        className="object-contain drop-shadow-sm"
      />
    </div>
  );
}
