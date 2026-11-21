'use client';

import { useEffect, useRef } from 'react';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'rise' | 'mask' | 'grid';
};

export default function Reveal({ children, className = '', variant = 'rise' }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches || !('IntersectionObserver' in window)) {
      element.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add('is-visible');
        observer.unobserve(element);
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px',
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={['reveal', className].filter(Boolean).join(' ')}
      data-reveal-variant={variant}
    >
      {children}
    </div>
  );
}