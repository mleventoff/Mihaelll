/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SmokeLog } from '../types';
import { Trash2, Plus, Clock, Eye, AlertCircle } from 'lucide-react';
import { formatLocalDate, formatTime } from '../utils';

interface HistoryListProps {
  logs: SmokeLog[];
  selectedDateStr: string | null; // Null means "Show all of today's" or "All logs"
  onDeleteLog: (id: string) => void;
  onAddManualLog: (timestamp: number) => void;
}

export default function HistoryList({
  logs,
  selectedDateStr,
  onDeleteLog,
  onAddManualLog,
}: HistoryListProps) {
  const [showAddManual, setShowAddManual] = useState(false);
  const [customMinutesAgo, setCustomMinutesAgo] = useState('10');
  const [customHour, setCustomHour] = useState('');
  const [customMin, setCustomMin] = useState('');

  // 1. Filter logs for the selected date
  // If selectedDateStr is null, default to showing Today's logs first
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local format
  const activeDateStr = selectedDateStr || todayStr;

  const filteredLogs = logs.filter(log => {
    const d = new Date(log.timestamp);
    const logDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    // If activeDateStr is of length 7 (e.g. YYYY-MM), match as month prefix
    if (activeDateStr.length === 7) {
      return logDateStr.startsWith(activeDateStr);
    }
    return logDateStr === activeDateStr;
  });

  const getReadableTitle = () => {
    if (activeDateStr.length === 7) {
      const date = new Date(activeDateStr + '-01T00:00:00');
      const monthLabel = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      return monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
    }
    return formatLocalDate(activeDateStr);
  };

  const handleAddMinutesAgo = (minutes: number) => {
    const timestamp = Date.now() - minutes * 60 * 1000;
    onAddManualLog(timestamp);
    setShowAddManual(false);
  };

  const handleAddCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHour || !customMin) return;

    const hourNum = parseInt(customHour, 10);
    const minNum = parseInt(customMin, 10);

    if (isNaN(hourNum) || hourNum < 0 || hourNum > 23 || isNaN(minNum) || minNum < 0 || minNum > 59) {
      alert('Пожалуйста, введите корректное время (Часы: 0-23, Минуты: 0-59)');
      return;
    }

    // Set custom time today
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourNum, minNum, 0, 0);
    
    // Safety check - do not allow future times
    if (targetDate.getTime() > Date.now()) {
      alert('Нельзя добавить затяжку в будущем времени!');
      return;
    }

    onAddManualLog(targetDate.getTime());
    setShowAddManual(false);
    setCustomHour('');
    setCustomMin('');
  };

  return (
    <div id="history-logs-card" className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm">
      {/* List Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span>История за: {getReadableTitle()}</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'запись' : filteredLogs.length > 1 && filteredLogs.length < 5 ? 'записи' : 'записей'}
          </p>
        </div>

        {/* Add manual button only for Today */}
        {activeDateStr === todayStr && (
          <button
            onClick={() => setShowAddManual(!showAddManual)}
            className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Забыли отметить?</span>
          </button>
        )}
      </div>

      {/* Manual Logger Drawer UI */}
      {showAddManual && (
        <div className="mb-6 p-4 bg-amber-50/55 rounded-2xl border border-amber-200/50 space-y-4 transition-all duration-300">
          <div>
            <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Добавить сигарету задним числом</h4>
            <p className="text-xs text-amber-900/60 mt-0.5">Выберите один из готовых пресетов или введите точное время</p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAddMinutesAgo(5)}
              className="text-xs bg-white border border-amber-200 hover:bg-amber-100 text-amber-950 font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              5 мин назад
            </button>
            <button
              onClick={() => handleAddMinutesAgo(15)}
              className="text-xs bg-white border border-amber-200 hover:bg-amber-100 text-amber-950 font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              15 мин назад
            </button>
            <button
              onClick={() => handleAddMinutesAgo(30)}
              className="text-xs bg-white border border-amber-200 hover:bg-amber-100 text-amber-950 font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              30 мин назад
            </button>
            <button
              onClick={() => handleAddMinutesAgo(60)}
              className="text-xs bg-white border border-amber-200 hover:bg-amber-100 text-amber-950 font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              1 час назад
            </button>
          </div>

          {/* Precise Time Form */}
          <form onSubmit={handleAddCustomTime} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Время:</span>
              <input
                type="text"
                maxLength={2}
                placeholder="ЧЧ"
                value={customHour}
                onChange={e => setCustomHour(e.target.value.replace(/\D/g, ''))}
                className="w-8 text-center font-semibold bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span>:</span>
              <input
                type="text"
                maxLength={2}
                placeholder="ММ"
                value={customMin}
                onChange={e => setCustomMin(e.target.value.replace(/\D/g, ''))}
                className="w-8 text-center font-semibold bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            
            <button
              type="submit"
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-lg cursor-pointer shadow-xs transition-colors whitespace-nowrap"
            >
              Записать
            </button>
          </form>
        </div>
      )}

      {/* Logs Chronological List */}
      <div id="chronological-logs-list" className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-zinc-400">
            <AlertCircle className="w-8 h-8 text-zinc-300 mb-2 animate-pulse" />
            <p className="text-sm font-medium">Нет затяжек за этот день</p>
            <p className="text-xs text-zinc-400 mt-1">Они появятся здесь, как только вы нажмете кнопку "Затяжка".</p>
          </div>
        ) : (
          filteredLogs
            .map((log) => (
              <div
                key={log.id}
                className="flex justify-between items-center py-2.5 px-4 bg-zinc-50 hover:bg-zinc-100/60 rounded-xl transition-all duration-200 flex-row"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500" />
                  <span className="text-sm font-semibold text-zinc-800">{formatTime(log.timestamp)}</span>
                  <span className="text-xs text-zinc-400">Сигарета отмечена</span>
                </div>
                
                <button
                  onClick={() => onDeleteLog(log.id)}
                  title="Удалить запись"
                  className="p-1 px-1.5 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
