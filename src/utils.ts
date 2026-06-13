/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SmokeLog, AppSettings, DayStats } from './types';

// Get local date string 'YYYY-MM-DD' from a timestamp
export function getLocalDateString(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date to local readable format, e.g., "13 июня" or "Сегодня"
export function formatLocalDate(dateStr: string): string {
  const todayStr = getLocalDateString(Date.now());
  const yesterdayStr = getLocalDateString(Date.now() - 24 * 60 * 60 * 1000);

  if (dateStr === todayStr) return 'Сегодня';
  if (dateStr === yesterdayStr) return 'Вчера';

  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

// Format exact time from timestamp
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Calculate time difference between now and the last timestamp
export function formatTimeSince(lastTimestamp: number, currentTimestamp: number): string {
  const diffMs = currentTimestamp - lastTimestamp;
  if (diffMs < 0) return '0 м';
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) {
    return `${diffMins} м`;
  }
  
  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;
  if (diffHours < 24) {
    return `${diffHours} ч ${remainingMins} м`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  return `${diffDays} д ${remainingHours} ч`;
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  dailyLimit: 12,
  packPrice: 100,
  cigarettesPerPack: 20,
  currency: '₴',
  showSmokeEffect: true,
  congratulationIntervalMins: 90,
  showFinancials: true,
};

// Generates beautiful realistic pre-filled history for testing/showcasing
export function generateSeedData(): SmokeLog[] {
  const logs: SmokeLog[] = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  // We seed the past 60 days so both month and year charts look incredible.
  for (let daysAgo = 1; daysAgo <= 60; daysAgo++) {
    const targetDay = now - daysAgo * oneDay;
    const targetDate = new Date(targetDay);
    
    // Day of week variance (maybe smoke slightly more on Friday/Saturday)
    const dayOfWeek = targetDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    
    // Average 8-10 on weekdays, 12-15 on weekends
    const count = isWeekend 
      ? 11 + Math.floor(Math.random() * 5) 
      : 7 + Math.floor(Math.random() * 5);
    
    // Create random smoke patterns through the day
    for (let i = 0; i < count; i++) {
      // spread between 7:30 and 23:45
      const hour = 7 + Math.floor((i / count) * 16) + (Math.random() > 0.5 ? 1 : 0);
      const minute = Math.floor(Math.random() * 60);
      
      const logDate = new Date(targetDate);
      logDate.setHours(Math.max(0, Math.min(23, hour)), minute, 0, 0);
      
      logs.push({
        id: `seed-${daysAgo}-${i}`,
        timestamp: logDate.getTime(),
      });
    }
  }

  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

// Group logs into DayStats array
export function getHistoryByDay(logs: SmokeLog[]): DayStats[] {
  const groups: { [key: string]: SmokeLog[] } = {};
  
  // Group
  logs.forEach(log => {
    const dateStr = getLocalDateString(log.timestamp);
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(log);
  });
  
  // Convert to array
  return Object.keys(groups).map(dateStr => {
    const dayLogs = groups[dateStr].sort((a, b) => b.timestamp - a.timestamp);
    return {
      dateStr,
      count: dayLogs.length,
      logs: dayLogs,
    };
  }).sort((a, b) => b.dateStr.localeCompare(a.dateStr)); // Descending by date
}

// Cost calculations
export function calculateFinancials(logsCount: number, settings: AppSettings) {
  const costPerCigarette = settings.packPrice / settings.cigarettesPerPack;
  const totalCost = logsCount * costPerCigarette;
  return {
    costPerCigarette,
    totalCost,
  };
}
