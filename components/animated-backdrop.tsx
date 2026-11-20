'use client';
import { motion } from 'framer-motion';
export function AnimatedBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl"
        animate={{ x: [0, 70, 0], y: [0, -25, 0], scale: [1, 1.18, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ x: [0, -55, 0], y: [0, 35, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
