/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, ShieldCheck, Heart, Sparkles, Smile, Hourglass, CheckCircle2 } from 'lucide-react';
import { AppSettings } from '../types';

interface CongratsCardProps {
  lastSmokeTime: number | null;
  settings: AppSettings;
  todayCount: number;
}

export default function CongratsCard({
  lastSmokeTime,
  settings,
  todayCount
}: CongratsCardProps) {
  const [now, setNow] = useState(Date.now());
  const intervalMins = settings.congratulationIntervalMins ?? 90;

  // Sync internal timer every 10 seconds for real-time reactivity
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Determine elapsed time
  let elapsedMins = 0;
  let isCleanAllDay = false;

  if (lastSmokeTime === null) {
    isCleanAllDay = true;
  } else {
    const diffMs = now - lastSmokeTime;
    elapsedMins = Math.floor(diffMs / (1000 * 60));
    // If the last smoke was yesterday or earlier, consider them clean since last log which is awesome!
    // But we also flag if todayCount is 0 as clean all day.
    if (todayCount === 0) {
      isCleanAllDay = true;
    }
  }

  // Format hours and minutes representing the current smoke-free streak
  const formatStreak = (mins: number) => {
    if (mins < 60) return `${mins} мин`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} ч ${m} мин`;
  };

  // Health recovery milestones list
  const healthMilestones = [
    { mins: 20, text: 'Давление и пульс снижаются до нормы', label: '20 минут' },
    { mins: 120, text: 'Выводится никотин, проходит спазм сосудов', label: '2 часа' },
    { mins: 480, text: 'Уровень угарного газа падает на 50%', label: '8 часов' },
    { mins: 1440, text: 'Риск инфаркта миокарда начинает снижаться', label: '24 часа' },
  ];

  // Random positive congratulations messages to keep things fresh
  const congratulationsArray = [
    'Вы невероятно сильный человек! Организм очищается с каждой минутой.',
    'Какая прекрасная выдержка! Вы делаете неоценимый подарок своему сердцу и легким.',
    'Вы — огромный молодец! Трезвость вдохновляет. Держитесь так же уверенно!',
    'Отличная пауза! Вы полностью контролируете свои привычки, а не они вас.',
    'Каждая секунда без дыма — это победа разума над тягой. Гордимся вашим результатом!',
    'Вы чувствуете, как возвращаются силы? Чистый воздух наполняет легкие!'
  ];

  // Select a consistent pseudo-random message based on the hour/streak so it doesn't flicker on re-renders
  const msgIndex = (Math.floor(elapsedMins / 30) || todayCount) % congratulationsArray.length;
  const motivationMsg = congratulationsArray[msgIndex];

  // Check if current streak exceeds the target interval
  const isCongratulated = isCleanAllDay || elapsedMins >= intervalMins;

  // Progress percentage toward the next interval milestone
  const nextIntervalProgress = isCleanAllDay 
    ? 100 
    : Math.min(100, Math.round((elapsedMins / intervalMins) * 100));

  const remainingMins = Math.max(0, intervalMins - elapsedMins);

  return (
    <div 
      id="congratulation-streak-card" 
      className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm relative overflow-hidden ${
        isCongratulated 
          ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/30 to-white border-emerald-200/60' 
          : 'bg-white border-zinc-100'
      }`}
    >
      {/* Visual background sparkles or glowing rings */}
      <AnimatePresence>
        {isCongratulated && (
          <>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-4 right-4 text-emerald-500/30 pointer-events-none"
            >
              <Sparkles className="w-12 h-12" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4">
        {/* Header Title with animated badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className={`text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full inline-block ${
              isCongratulated 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' 
                : 'bg-amber-50 text-amber-800 border border-amber-200/30'
            }`}>
              {isCleanAllDay 
                ? 'Идеальный день!' 
                : isCongratulated 
                  ? 'Поздравляем! Цель достигнута' 
                  : 'Счетчик сознательности'}
            </span>
            <h3 className="text-sm font-bold text-zinc-900 mt-1 flex items-center gap-1.5">
              <span>Чистый интервал без курения:</span>
              <span className={`font-mono text-base font-black ${isCongratulated ? 'text-emerald-600' : 'text-amber-500'}`}>
                {isCleanAllDay ? 'Сегодня без дыма!' : formatStreak(elapsedMins)}
              </span>
            </h3>
          </div>

          <div className={`p-2.5 rounded-2xl shrink-0 ${
            isCongratulated ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-zinc-100 text-zinc-500'
          }`}>
            {isCleanAllDay ? (
              <ShieldCheck className="w-5 h-5 animate-bounce" />
            ) : isCongratulated ? (
              <Award className="w-5 h-5 animate-pulse" />
            ) : (
              <Hourglass className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Motivational message or timer update */}
        {isCongratulated ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex gap-2.5 items-start"
          >
            <Smile className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-900">Вы — большой молодец! 🎉</p>
              <p className="text-xs text-emerald-800/80 leading-relaxed mt-0.5">
                {isCleanAllDay 
                  ? 'Вы не сделали ни единой затяжки за сегодня! Организм очищается, легкие вздыхают с облегчением.' 
                  : `Вы успешно преодолели настроенный барьер в ${intervalMins} минут трезвости! ${motivationMsg}`}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Horizontal custom progress tracker to next achievement */}
            <div className="space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between items-baseline">
                <span>Прогресс до награды за выдержку в {intervalMins} минут:</span>
                <span className="font-bold text-amber-600">{nextIntervalProgress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${nextIntervalProgress}%` }}
                />
              </div>
              <p className="text-[10.5px] text-zinc-400 font-medium">
                Осталось выдержать <strong>{remainingMins} мин</strong> до персонального поздравления. Вы сильнее, чем кратковременная тяга!
              </p>
            </div>
          </div>
        )}

        {/* Interactive checkable Health Milestones (Micro-educational panel) */}
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-zinc-600 font-bold text-[10.5px] uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Интерактивные фазы восстановления тела</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {healthMilestones.map((m, idx) => {
              const reached = isCleanAllDay || elapsedMins >= m.mins;
              return (
                <div 
                  key={idx} 
                  className={`flex items-start gap-2 p-2 rounded-xl border transition-all ${
                    reached 
                      ? 'bg-emerald-500/5 border-emerald-500/15 text-zinc-800' 
                      : 'bg-white border-zinc-100 text-zinc-400'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                    reached ? 'text-emerald-500' : 'text-zinc-200'
                  }`} />
                  <div>
                    <span className={`text-[10px] font-extrabold tracking-tight uppercase block leading-none ${
                      reached ? 'text-emerald-700' : 'text-zinc-400'
                    }`}>
                      {m.label} {reached ? '— Ура!' : ''}
                    </span>
                    <span className="text-[10.5px] font-medium leading-tight mt-0.5 block">{m.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
