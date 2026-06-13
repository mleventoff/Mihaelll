/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SmokeLog {
  id: string;      // Unique identifier
  timestamp: number; // UNIX timestamp in milliseconds
}

export interface AppSettings {
  dailyLimit: number;       // Limit of cigarettes per day
  packPrice: number;        // Cost of one pack
  cigarettesPerPack: number; // Number of cigarettes in one pack
  currency: string;         // Currency symbol (e.g., "₽", "$")
  showSmokeEffect: boolean; // Toggle interactive smoke animation
  congratulationIntervalMins: number; // Interval in minutes to congratulate the user for not smoking
  showFinancials: boolean;  // Toggle displaying financial information
}

export interface DayStats {
  dateStr: string;     // Local date string in format "YYYY-MM-DD"
  count: number;       // Number of cigarettes smoked that day
  logs: SmokeLog[];    // Logs for that specific day
}
