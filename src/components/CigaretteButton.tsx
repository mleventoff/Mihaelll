/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Flame, Timer } from 'lucide-react';
import { AppSettings } from '../types';

interface CigaretteButtonProps {
  onSmoke: () => void;
  lastSmokeTime: number | null;
  settings: AppSettings;
  todayCount: number;
}

interface SmokeParticle {
  id: number;
  x: number;      // Drift X
  y: number;      // Drift Y
  scale: number;
  duration: number;
  rotate: number;
}

export default function CigaretteButton({
  onSmoke,
  lastSmokeTime,
  settings,
  todayCount,
}: CigaretteButtonProps) {
  const [particles, setParticles] = useState<SmokeParticle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Keep track of time elapsed in the visual label
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000); // update every 10 seconds is plenty for "1 ч 15 м" accuracy
    return () => clearInterval(timer);
  }, []);

  const triggerSmokeEffect = () => {
    if (!settings.showSmokeEffect) return;

    // Generate 6-8 smoke particles drifting up
    const newParticles: SmokeParticle[] = Array.from({ length: 7 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: (Math.random() - 0.5) * 120, // drift left/right -60px to +60px
      y: -120 - Math.random() * 100,  // drift up -120px to -220px
      scale: 1.5 + Math.random() * 2.5, // grow in size
      duration: 1.8 + Math.random() * 1.2, // stay visible for 1.8s to 3.0s
      rotate: (Math.random() - 0.5) * 90, // rotate gently
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    // Clean up particles after they finish animating
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 3200);
  };

  const handleClick = () => {
    triggerSmokeEffect();
    onSmoke();
  };

  // Human-friendly time elapsed calculation
  const getElapsedString = () => {
    if (!lastSmokeTime) return 'Ещё нет записей за сегодня';
    const diffMs = currentTime - lastSmokeTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `Прошло ${diffMins} мин`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `Прошло ${hours} ч ${mins} мин`;
  };

  // Limit indicators
  const limitReached = todayCount >= settings.dailyLimit;
  const closeToLimit = todayCount >= settings.dailyLimit * 0.8 && todayCount < settings.dailyLimit;

  // Set color accent based on smoke status
  let ringColor = 'border-amber-500/20 hover:border-amber-500/40 bg-zinc-50';
  let accentColor = 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/20';
  
  if (limitReached) {
    ringColor = 'border-rose-500/20 hover:border-rose-500/40 bg-rose-50/10';
    accentColor = 'bg-gradient-to-tr from-rose-500 to-red-600 shadow-rose-500/20';
  } else if (closeToLimit) {
    ringColor = 'border-yellow-500/20 hover:border-yellow-500/40 bg-yellow-50/10';
    accentColor = 'bg-gradient-to-tr from-yellow-500 to-amber-500 shadow-yellow-500/20';
  }

  return (
    <div id="smoke-tracker-interactive-card" className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm relative overflow-visible">
      {/* Visual smoke particle container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-visible z-10">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.6, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [0, 0.45, 0.15, 0],
                x: p.x,
                y: p.y,
                scale: p.scale,
                rotate: p.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                ease: 'easeOut',
              }}
              className="absolute top-12 left-1/2 -translate-x-1/2 w-6 h-6 bg-zinc-400/20 blur-md rounded-full"
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Button Ripple / Outer Ring */}
      <div className={`p-4 rounded-full border-4 transition-all duration-300 relative z-20 ${ringColor}`}>
        <motion.button
          id="btn-smoke-trigger"
          whileTap={{ scale: 0.94 }}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white font-medium cursor-pointer relative overflow-hidden transition-all duration-500 shadow-lg ${accentColor}`}
        >
          {/* Internal gradient wave when hovered */}
          <motion.div
            className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300"
            animate={{ opacity: isHovered ? 1 : 0 }}
          />

          <Plus className="w-8 h-8 mb-1 relative z-10" />
          <span className="text-sm font-semibold tracking-wide uppercase relative z-10">Затяжка</span>
          <span className="text-[10px] opacity-80 mt-1 relative z-10">нажми сюда</span>

          {/* Ember burning indicator */}
          <div className="absolute bottom-4 flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full text-[9px] backdrop-blur-xs">
            <Flame className="w-3 h-3 text-orange-300 animate-pulse" />
            <span>горит</span>
          </div>
        </motion.button>
      </div>

      {/* Elapsed time and info */}
      <div className="mt-5 text-center">
        <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-sm">
          <Timer className="w-4 h-4 text-zinc-400" />
          <span>{getElapsedString()}</span>
        </div>
        
        {limitReached && (
          <p className="text-xs text-rose-500 mt-2 font-medium bg-rose-50 px-3 py-1 rounded-full inline-block">
            Превышен дневной лимит! Попробуйте сделать паузу.
          </p>
        )}
        {closeToLimit && (
          <p className="text-xs text-yellow-600 mt-2 font-medium bg-yellow-50 px-3 py-1 rounded-full inline-block">
            Приближаетесь к лимиту в {settings.dailyLimit} шт.
          </p>
        )}
      </div>
    </div>
  );
}
