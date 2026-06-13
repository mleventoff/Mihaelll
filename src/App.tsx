/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SmokeLog, AppSettings, DayStats } from './types';
import {
  DEFAULT_SETTINGS,
  generateSeedData,
  getLocalDateString,
  getHistoryByDay,
} from './utils';

// Import components
import CigaretteButton from './components/CigaretteButton';
import StatsDashboard from './components/StatsDashboard';
import HistoryList from './components/HistoryList';
import SettingsPanel from './components/SettingsPanel';
import WearOSSimulator from './components/WearOSSimulator';
import CongratsCard from './components/CongratsCard';

// Icons
import { Flame, Info, RotateCcw, Activity } from 'lucide-react';

export default function App() {
  // 1. Core State
  const [logs, setLogs] = useState<SmokeLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // 2. Load from localStorage
  useEffect(() => {
    // Load Settings
    const storedSettings = localStorage.getItem('cigaretteTrackerSettings');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error('Error parsing stored settings, using default', e);
      }
    }

    // Load Logs
    const storedLogs = localStorage.getItem('cigaretteTrackerLogs');
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs);
        setLogs(parsedLogs);
      } catch (e) {
        console.error('Error parsing stored logs, using default', e);
      }
    } else {
      // First run: Seed beautiful historical data for showcase, leaving today fully ready
      const seedData = generateSeedData();
      localStorage.setItem('cigaretteTrackerLogs', JSON.stringify(seedData));
      setLogs(seedData);
      setIsDemo(true);
    }
  }, []);

  // 3. Save to localStorage helpers
  const saveLogs = (newLogs: SmokeLog[]) => {
    setLogs(newLogs);
    localStorage.setItem('cigaretteTrackerLogs', JSON.stringify(newLogs));
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('cigaretteTrackerSettings', JSON.stringify(newSettings));
  };

  // 4. Primary Interactive Logging handlers
  const handleAddNewSmoke = () => {
    const newLog: SmokeLog = {
      id: `smoke-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    saveLogs([newLog, ...logs]);
    
    // If they were on demo mode, clicking the main action button leaves day summary selections responsive but dismisses the demonstration banner
    if (isDemo) {
      setIsDemo(false);
    }
  };

  const handleAddManualSmoke = (timestamp: number) => {
    const newLog: SmokeLog = {
      id: `smoke-manual-${Date.now()}-${Math.random()}`,
      timestamp,
    };
    // Save in sorted chronological place
    const updated = [newLog, ...logs].sort((a, b) => b.timestamp - a.timestamp);
    saveLogs(updated);
  };

  const handleDeleteSmoke = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту затяжку из истории?')) {
      const updated = logs.filter(log => log.id !== id);
      saveLogs(updated);
    }
  };

  // Dismiss demo database mode
  const handleClearDemoHistorical = () => {
    if (confirm('Вы хотите удалить демонстрационные логи и начать с абсолютно чистого листа?')) {
      saveLogs([]);
      setIsDemo(false);
    }
  };

  // 5. Config backups & cloud sync formats
  const handleExportJSON = (): string => {
    return JSON.stringify({
      version: 1,
      settings,
      logs,
    });
  };

  const handleImportJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings && Array.isArray(parsed.logs)) {
        setSettings(parsed.settings);
        setLogs(parsed.logs);
        localStorage.setItem('cigaretteTrackerSettings', JSON.stringify(parsed.settings));
        localStorage.setItem('cigaretteTrackerLogs', JSON.stringify(parsed.logs));
        setIsDemo(false);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleFullReset = () => {
    localStorage.removeItem('cigaretteTrackerLogs');
    localStorage.removeItem('cigaretteTrackerSettings');
    setLogs([]);
    setSettings(DEFAULT_SETTINGS);
    setIsDemo(false);
    setSelectedDateStr(null);
  };

  // Group logs into Day summaries
  const dayStatsList = getHistoryByDay(logs);

  // Today calculations
  const todayDateStr = getLocalDateString(Date.now());
  const todayLogs = logs.filter(log => getLocalDateString(log.timestamp) === todayDateStr);
  const todayCount = todayLogs.length;

  // Last smoked calculation (overall latest cigarette)
  const lastSmokeTime = logs.length > 0 ? logs[0].timestamp : null;

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 font-sans selection:bg-amber-100 selection:text-amber-900 pb-16">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 rounded-xl text-white shadow-md shadow-amber-500/15">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-950 tracking-tight">Сигаретный Трекер</h1>
              <p className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">Осознанный Счетчик</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full text-[11px] px-2.5 font-semibold text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Активен локально
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Demo Data Banner Header */}
        {isDemo && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/80 flex items-start gap-3 justify-between flex-wrap sm:flex-nowrap">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Добавлены демонстрационные данные</h4>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  Мы создали реалистичную историю за прошедшие 60 дней, чтобы вы могли сразу опробовать новые вкладки статистики за **Неделю**, **Месяц** и **Год** в действии. Сегодняшний день абсолютно чист и готов к вашим реальным отметкам.
                </p>
              </div>
            </div>
            <button
              onClick={handleClearDemoHistorical}
              className="flex items-center gap-1.5 text-[11px] font-bold bg-amber-100 hover:bg-amber-200/85 text-amber-950 px-3 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить демо</span>
            </button>
          </div>
        )}

        {/* 2. Top-Level Core Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Action Left Bar */}
          <div className="md:col-span-5 space-y-6">
            {/* The main smoking trigger button */}
            <CigaretteButton
              onSmoke={handleAddNewSmoke}
              lastSmokeTime={lastSmokeTime}
              settings={settings}
              todayCount={todayCount}
            />

            {/* Smart reminder & Congratulations block */}
            <CongratsCard
              lastSmokeTime={lastSmokeTime}
              settings={settings}
              todayCount={todayCount}
            />

            {/* Quick Helper Tips */}
            <div className="p-5 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-3xl text-zinc-100 shadow-md">
              <span className="text-[10px] font-semibold tracking-widest text-amber-400 uppercase">Совет по сокращению</span>
              <h4 className="text-sm font-bold text-white mt-1">Осознанная пауза</h4>
              <p className="text-xs text-zinc-300 leading-relaxed mt-1.5">
                Каждый раз, когда захочется курить, постарайтесь подождать всего 5 минут перед тем, как затянуться и нажать кнопку. В вечном таймере вверху отображается, сколько времени прошло с прошлой сигареты. Увеличивайте этот интервал изо дня в день!
              </p>
            </div>
          </div>

          {/* Interactive Statistics Visualizer Right Bar */}
          <div className="md:col-span-7">
            <StatsDashboard
              dayStatsList={dayStatsList}
              settings={settings}
              todayCount={todayCount}
              onSelectDay={setSelectedDateStr}
              selectedDay={selectedDateStr}
            />
          </div>
        </div>

        {/* Wear OS Circular smartwatch simulator linked sync */}
        <WearOSSimulator
          todayCount={todayCount}
          onSmokeFromWatch={handleAddNewSmoke}
          dailyLimit={settings.dailyLimit}
        />

        {/* 3. Daily History chronological timeline logs list */}
        <div id="historical-scroller-node">
          <HistoryList
            logs={logs}
            selectedDateStr={selectedDateStr}
            onDeleteLog={handleDeleteSmoke}
            onAddManualLog={handleAddManualSmoke}
          />
        </div>

        {/* 4. Controls, back up exports, adjustments settings panel */}
        <div id="settings-scroller-node">
          <SettingsPanel
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onExportData={handleExportJSON}
            onImportData={handleImportJSON}
            onClearAllData={handleFullReset}
          />
        </div>
      </main>

      {/* Elegant structural footer */}
      <footer className="mt-16 text-center text-zinc-400 text-xs">
        <p className="font-semibold text-zinc-500">Сигаретный Трекер • Осознанный подход к здоровью</p>
        <p className="text-[10px] mt-1 text-zinc-400">Все данные хранятся локально в вашем браузере.</p>
      </footer>
    </div>
  );
}
