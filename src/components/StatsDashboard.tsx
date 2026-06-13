/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppSettings, DayStats } from '../types';
import { Coins, Activity, TrendingDown, ClipboardList, CalendarDays } from 'lucide-react';
import { formatLocalDate } from '../utils';

interface StatsDashboardProps {
  dayStatsList: DayStats[];
  settings: AppSettings;
  todayCount: number;
  onSelectDay: (dateStr: string | null) => void;
  selectedDay: string | null;
}

export default function StatsDashboard({
  dayStatsList,
  settings,
  todayCount,
  onSelectDay,
  selectedDay,
}: StatsDashboardProps) {
  const [rangeTab, setRangeTab] = useState<'week' | 'month' | 'year'>('week');

  // 1. Calculate General All-Time Metrics
  const activeDaysCount = Math.max(1, dayStatsList.length);
  const totalCigarettes = dayStatsList.reduce((acc, curr) => acc + curr.count, 0);
  const averagePerDay = Number((totalCigarettes / activeDaysCount).toFixed(1));
  
  // Days within limit
  const daysWithinLimit = dayStatsList.filter(d => d.count <= settings.dailyLimit).length;
  
  // Pack equivalents
  const totalPacks = Number((totalCigarettes / settings.cigarettesPerPack).toFixed(1));
  
  // Cost Spent
  const pricePerCigarette = settings.packPrice / settings.cigarettesPerPack;
  const totalMoneySpent = Math.round(totalCigarettes * pricePerCigarette);
  const todayMoneySpent = Math.round(todayCount * pricePerCigarette);

  const oneDayMs = 24 * 60 * 60 * 1000;

  // 2. Prepare datasets for all three intervals
  
  // A. WEEK DATA (7 Days)
  const chartDays: { dateStr: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const historicalTime = Date.now() - i * oneDayMs;
    const dateObj = new Date(historicalTime);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const matchingDay = dayStatsList.find(d => d.dateStr === dateStr);
    
    let label = dateObj.toLocaleDateString('ru-RU', { weekday: 'short' });
    if (i === 0) label = 'Сегодня';
    else if (i === 1) label = 'Вчера';

    chartDays.push({
      dateStr,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      count: matchingDay ? matchingDay.count : 0,
    });
  }

  // B. MONTH DATA (30 Days)
  const monthlyDays: { dateStr: string; label: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const historicalTime = Date.now() - i * oneDayMs;
    const dateObj = new Date(historicalTime);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const matchingDay = dayStatsList.find(d => d.dateStr === dateStr);
    
    const dayNum = dateObj.getDate();
    let label = `${dayNum}`;
    // Dense text layout label
    if (dayNum % 5 === 0 || i === 0) {
      const monthShort = dateObj.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');
      label = `${dayNum} ${monthShort}`;
    }

    monthlyDays.push({
      dateStr,
      label,
      count: matchingDay ? matchingDay.count : 0,
    });
  }

  // C. YEAR DATA (12 Months)
  const yearlyMonths: { monthKey: string; label: string; count: number; average: number }[] = [];
  const currentMonthDate = new Date();
  for (let i = 11; i >= 0; i--) {
    const targetMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - i, 1);
    const year = targetMonthDate.getFullYear();
    const month = targetMonthDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    // Filter all logs in this year & month starting prefix
    const matchingDaysInMonth = dayStatsList.filter(d => d.dateStr.startsWith(monthKey));
    const totalMonthCount = matchingDaysInMonth.reduce((acc, curr) => acc + curr.count, 0);
    const daysWithData = matchingDaysInMonth.length || 1;
    const avgVal = Number((totalMonthCount / daysWithData).toFixed(1));

    const monthLabelStr = targetMonthDate.toLocaleDateString('ru-RU', { month: 'short' });
    const capitalizedLabel = monthLabelStr.charAt(0).toUpperCase() + monthLabelStr.slice(1).replace('.', '');

    yearlyMonths.push({
      monthKey,
      label: `${capitalizedLabel}`,
      count: totalMonthCount,
      average: avgVal,
    });
  }

  // 3. Setup dynamic charts attributes based on selected range
  let activeChartData: { key: string; label: string; count: number; hoverText: string; highlight: boolean }[] = [];
  let chartLimit = settings.dailyLimit;
  let limitLabel = `Лимит: ${settings.dailyLimit}`;

  if (rangeTab === 'week') {
    activeChartData = chartDays.map(d => ({
      key: d.dateStr,
      label: d.label,
      count: d.count,
      hoverText: `${d.count} шт - ${formatLocalDate(d.dateStr)}`,
      highlight: selectedDay === d.dateStr,
    }));
    chartLimit = settings.dailyLimit;
    limitLabel = `Лимит: ${settings.dailyLimit}`;
  } else if (rangeTab === 'month') {
    activeChartData = monthlyDays.map(d => ({
      key: d.dateStr,
      label: d.label,
      count: d.count,
      hoverText: `${d.count} шт - ${formatLocalDate(d.dateStr)}`,
      highlight: selectedDay === d.dateStr,
    }));
    chartLimit = settings.dailyLimit;
    limitLabel = `Лимит: ${settings.dailyLimit}`;
  } else {
    // Year view total values
    activeChartData = yearlyMonths.map(m => ({
      key: m.monthKey,
      label: m.label,
      count: m.count,
      hoverText: `${m.count} шт (ср. ${m.average}/день)`,
      highlight: selectedDay?.startsWith(m.monthKey) || false,
    }));
    // Year view monthly limit equivalent is dailyLimit * 30 days
    chartLimit = settings.dailyLimit * 30;
    limitLabel = `Мес. лимит: ${chartLimit}`;
  }

  const chartCounts = activeChartData.map(d => d.count);
  const maxInChart = Math.max(chartLimit, ...chartCounts, 1);

  // Progress to today's limit
  const progressPercent = Math.min(100, Math.round((todayCount / settings.dailyLimit) * 100));
  
  // Status messages and layouts based on limits
  let progressBg = 'bg-emerald-500';
  let progressText = 'text-emerald-600';
  let encouragementMsg = 'Вы контролируете ситуацию. Отличная выдержка!';

  if (todayCount >= settings.dailyLimit) {
    progressBg = 'bg-rose-500';
    progressText = 'text-rose-600';
    encouragementMsg = 'Превышен лимит на сегодня. Сделайте глубокий вдох и отдохните';
  } else if (todayCount >= settings.dailyLimit * 0.8) {
    progressBg = 'bg-yellow-500';
    progressText = 'text-yellow-600';
    encouragementMsg = 'Вы близки к лимиту. Постарайтесь отвлечься чем-нибудь полезным';
  } else if (todayCount > 0) {
    encouragementMsg = 'Хорошо держитесь! Каждая невыкуренная сигарета — победа';
  }

  return (
    <div id="stats-dashboard-container" className="space-y-6">
      {/* Today's progress tracker */}
      <div id="today-progress-card" className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Прогресс за сегодня</h3>
            <div className="text-2xl font-bold text-zinc-950 mt-1 flex items-baseline gap-1">
              <span>{todayCount}</span>
              <span className="text-sm font-medium text-zinc-400">из {settings.dailyLimit} сигарет</span>
            </div>
          </div>
          <span className={`text-lg font-bold ${progressText}`}>{progressPercent}%</span>
        </div>

        {/* Outer progress line */}
        <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed italic">
          "{encouragementMsg}"
        </p>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Average per day */}
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100/60 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-500 text-ellipse truncate">В среднем в день</span>
            <Activity className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-zinc-950">{averagePerDay}</span>
            <span className="text-xs text-zinc-400 block mt-0.5">шт / день</span>
          </div>
        </div>

        {/* Card 2: Conditional Financials (Today spent) or Days within limit */}
        {settings.showFinancials ? (
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100/60 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-zinc-500 text-ellipse truncate">Расходы сегодня</span>
              <Coins className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <div className="mt-4">
              <span className="text-xl font-bold text-zinc-950">
                {todayMoneySpent} {settings.currency}
              </span>
              <span className="text-xs text-zinc-400 block mt-0.5">на сигареты</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100/60 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-zinc-500 text-ellipse truncate">Соблюдение нормы</span>
              <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <div className="mt-4">
              <span className="text-xl font-bold text-zinc-950">
                {daysWithinLimit} дн.
              </span>
              <span className="text-xs text-zinc-400 block mt-0.5">из {activeDaysCount} в лимите</span>
            </div>
          </div>
        )}

        {/* Card 3: Total Smoked */}
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100/60 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-500 text-ellipse truncate">Всего выкурено</span>
            <ClipboardList className="w-4 h-4 text-zinc-500 shrink-0" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-zinc-950">{totalCigarettes}</span>
            <span className="text-xs text-zinc-400 block mt-0.5">за весь период</span>
          </div>
        </div>

        {/* Card 4: Conditional Financials (Total money spent) or Tracked count days */}
        {settings.showFinancials ? (
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100/60 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-zinc-500 text-ellipse truncate">За все время</span>
              <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" />
            </div>
            <div className="mt-4">
              <span className="text-xl font-bold text-zinc-950">
                {totalMoneySpent} {settings.currency}
              </span>
              <span className="text-xs text-zinc-400 block mt-0.5">
                или {totalPacks} {totalPacks % 1 === 0 ? 'пачка' : 'пачки'}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100/60 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-zinc-500 text-ellipse truncate">Время под кураторством</span>
              <ClipboardList className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
            <div className="mt-4">
              <span className="text-xl font-bold text-zinc-950">
                {activeDaysCount} {activeDaysCount % 10 === 1 && activeDaysCount % 100 !== 11 ? 'день' : activeDaysCount % 10 >= 2 && activeDaysCount % 10 <= 4 && (activeDaysCount % 100 < 10 || activeDaysCount % 100 >= 20) ? 'дня' : 'дней'}
              </span>
              <span className="text-xs text-zinc-400 block mt-0.5">замеров в истории</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Upgraded History & Analytics Chart (Week, Month, Year tabs) */}
      <div id="history-chart-card" className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-zinc-400" />
              <span>Анализ и статистика привычек</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Кликните на любой столбец для фильтрации списка внизу</p>
          </div>

          {/* Core Tabs controls */}
          <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-bold gap-0.5 self-start">
            <button
              onClick={() => setRangeTab('week')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                rangeTab === 'week' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setRangeTab('month')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                rangeTab === 'month' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Месяц (30д)
            </button>
            <button
              onClick={() => setRangeTab('year')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                rangeTab === 'year' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Год (12м)
            </button>
          </div>
        </div>

        {/* Dynamic scrollable bar chart canvas area */}
        <div className="relative h-48 mt-8 flex items-end justify-between gap-0.5 sm:gap-1 px-1 overflow-x-auto scroller-slim select-none min-w-full pb-2">
          {/* Threshold marker line */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-zinc-300 z-10 pointer-events-none"
            style={{
              bottom: `${(chartLimit / maxInChart) * 100}%`,
            }}
          >
            <span className="absolute -top-5 right-1 bg-zinc-900 text-white px-1.5 py-0.5 rounded text-[9px] font-mono tracking-tight shadow-xs border border-zinc-800/80">
              {limitLabel}
            </span>
          </div>

          {activeChartData.map((day) => {
            const heightPercent = (day.count / maxInChart) * 100;
            const exceeded = day.count > chartLimit;
            
            // Highlight and background colors
            let barBg = 'bg-zinc-200/80 hover:bg-zinc-300';
            if (day.count > 0) {
              barBg = exceeded 
                ? 'bg-rose-400/85 hover:bg-rose-500' 
                : 'bg-amber-400/85 hover:bg-amber-500';
            }
            if (day.highlight) {
              barBg = exceeded ? 'bg-rose-600' : 'bg-amber-600';
            }

            // Compact sizing based on the active tab volume
            let widthClass = 'max-w-[36px]';
            if (rangeTab === 'month') {
              widthClass = 'max-w-[12px]';
            } else if (rangeTab === 'year') {
              widthClass = 'max-w-[28px]';
            }

            return (
              <div
                key={day.key}
                onClick={() => onSelectDay(day.key)}
                className="flex-1 flex flex-col items-center h-full group cursor-pointer relative justify-end min-w-[12px] sm:min-w-0"
              >
                {/* Visual tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-zinc-950 text-white text-[10px] py-1 px-2 rounded-lg shadow-lg z-30 whitespace-nowrap text-center">
                  <p className="font-bold">{day.hoverText}</p>
                </div>

                {/* Vertical graphical column bar */}
                <div className={`w-full px-0.5 flex flex-col justify-end h-full ${widthClass}`}>
                  <div
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                    className={`w-full rounded-t-sm sm:rounded-t-lg transition-all duration-300 ${barBg} ${
                      day.highlight ? 'ring-2 ring-offset-1 ring-zinc-500 shadow-md scale-105' : 'shadow-2xs'
                    }`}
                  />
                </div>

                {/* Local label under the column */}
                <span className={`text-[9px] sm:text-[10px] font-semibold mt-3 whitespace-nowrap ${
                  day.highlight ? 'text-zinc-950 font-bold underline decoration-2' : 'text-zinc-500'
                }`}>
                  {day.label}
                </span>
                
                {/* Tiny indicator dot marking entries */}
                {day.count > 0 && rangeTab !== 'month' && (
                  <span className={`absolute bottom-[-16px] w-1.5 h-1.5 rounded-full ${
                    exceeded ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Actions bar bottom info */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-100 flex-wrap gap-2">
          <span className="text-[11px] text-zinc-400">
            *Кликая на конкретные графики, вы отфильтруете логи внизу.
          </span>
          {selectedDay && (
            <button
              onClick={() => onSelectDay(null)}
              className="text-xs text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer"
            >
              Сбросить фильтр вида
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
