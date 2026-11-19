'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

type Props = { children: ReactNode; className?: string; as?: 'div' | 'article'; intensity?: number; };

export default function MotionSurface({ children, className = '', as = 'div', intensity = 1 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReduceMotion(preference.matches);
    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => preference.removeEventListener('change', syncPreference);
  }, []);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [7 * intensity, -7 * intensity]), { stiffness: 180, damping: 22, mass: 0.45 });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-8 * intensity, 8 * intensity]), { stiffness: 180, damping: 22, mass: 0.45 });
  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }
  function reset() { pointerX.set(0); pointerY.set(0); }
  const shared = {
    ref,
    className: className + (reduceMotion ? '' : ' motion-surface'),
    onPointerMove: handleMove,
    onPointerLeave: reset,
    style: reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 1100, transformStyle: 'preserve-3d' as const },
    whileHover: reduceMotion ? undefined : { y: -5, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
  };
  return as === 'article' ? <motion.article {...shared}>{children}</motion.article> : <motion.div {...shared}>{children}</motion.div>;
}