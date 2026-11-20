'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: 'up' | 'left' | 'right' | 'zoom';
  delay?: number;
};

const VARIANT_CLASS: Record<NonNullable<RevealProps['variant']>, string> = {
  up: '',
  left: 'reveal-left',
  right: 'reveal-right',
  zoom: 'reveal-zoom',
};

export default function Reveal({
  children,
  className = '',
  variant = 'up',
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${VARIANT_CLASS[variant]} ${
        visible ? 'is-visible' : ''
      } ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
