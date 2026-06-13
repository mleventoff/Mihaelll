/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Settings, Save, RefreshCw, Download, Upload, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onImportData: (jsonStr: string) => boolean;
  onExportData: () => string;
  onClearAllData: () => void;
}

export default function SettingsPanel({
  settings,
  onSaveSettings,
  onImportData,
  onExportData,
  onClearAllData,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(settings.dailyLimit.toString());
  const [packPrice, setPackPrice] = useState(settings.packPrice.toString());
  const [cigarettesPerPack, setCigarettesPerPack] = useState(settings.cigarettesPerPack.toString());
  const [currency, setCurrency] = useState(settings.currency);
  const [showSmokeEffect, setShowSmokeEffect] = useState(settings.showSmokeEffect);
  const [congratulationIntervalMins, setCongratulationIntervalMins] = useState((settings.congratulationIntervalMins ?? 90).toString());
  const [showFinancials, setShowFinancials] = useState(settings.showFinancials ?? true);

  // Import states
  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  // Reset confirmation state
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseInt(dailyLimit, 10);
    const price = parseFloat(packPrice);
    const size = parseInt(cigarettesPerPack, 10);
    const interval = parseInt(congratulationIntervalMins, 10);

    if (isNaN(limit) || limit <= 0) return alert('Дневной лимит должен быть числом больше 0');
    if (isNaN(price) || price < 0) return alert('Цена пачки должна быть положительным числом');
    if (isNaN(size) || size <= 0) return alert('Количество сигарет в пачке должно быть больше 0');
    if (isNaN(interval) || interval <= 0) return alert('Интервал поздравлений должен быть больше 0 минут');

    onSaveSettings({
      dailyLimit: limit,
      packPrice: price,
      cigarettesPerPack: size,
      currency,
      showSmokeEffect,
      congratulationIntervalMins: interval,
      showFinancials,
    });
    
    alert('Настройки успешно сохранены!');
  };

  const handleExport = () => {
    const json = onExportData();
    // Copy to clipboard
    navigator.clipboard.writeText(json)
      .then(() => alert('Данные экспортированы и скопированы в буфер обмена!'))
      .catch(() => {
        // Fallback or display in area
        alert('Не удалось скопировать. Скопируйте текст вручную: \n\n' + json);
      });
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    setImportSuccess(false);

    if (!importText.trim()) {
      setImportError('Поле ввода пустое');
      return;
    }

    const success = onImportData(importText);
    if (success) {
      setImportSuccess(true);
      setImportText('');
      setTimeout(() => {
        setShowImportArea(false);
        setImportSuccess(false);
      }, 2000);
    } else {
      setImportError('Некорректный формат данных. Проверьте скопированный JSON.');
    }
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    onClearAllData();
    setConfirmReset(false);
    alert('Все данные были успешно удалены.');
  };

  return (
    <div id="settings-card-wrapper" className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
      {/* Toggle header bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-6 py-4 hover:bg-zinc-50 cursor-pointer transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold text-zinc-800">
          <Settings className="w-4 h-4 text-zinc-500 animate-spin-slow" />
          <span>Настройки и Управление</span>
        </span>
        <span className="text-xs text-zinc-400 font-medium">
          {isOpen ? 'Свернуть' : 'Развернуть'}
        </span>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-zinc-100 space-y-6">
          {/* Main settings form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Daily Limit */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Дневной лимит (сигарет)
                </label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 transition-all"
                  min="1"
                />
              </div>

              {/* Pack Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Цена одной пачки
                </label>
                <input
                  type="number"
                  value={packPrice}
                  onChange={(e) => setPackPrice(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 transition-all"
                  min="0"
                />
              </div>

              {/* Cigarettes Per Pack */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Количество сигарет в пачке
                </label>
                <input
                  type="number"
                  value={cigarettesPerPack}
                  onChange={(e) => setCigarettesPerPack(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 transition-all"
                  min="1"
                />
              </div>

              {/* Currency */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Валюта
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 transition-all"
                >
                  <option value="₴">₴ (Гривна)</option>
                  <option value="грн">грн (Гривна)</option>
                  <option value="₽">₽ (Рубль)</option>
                  <option value="руб.">руб.</option>
                  <option value="$">$ (Доллар)</option>
                  <option value="€">€ (Евро)</option>
                  <option value="₸">₸ (Тенге)</option>
                </select>
              </div>

              {/* Congratulation Interval */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Интервал похвалы без курения (минут)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={congratulationIntervalMins}
                    onChange={(e) => setCongratulationIntervalMins(e.target.value)}
                    className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 transition-all pr-12"
                    min="5"
                    placeholder="90"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">мин</span>
                </div>
                <p className="text-[10.5px] text-zinc-400 font-medium leading-tight">
                  Похвалим вас за стойкость при достижении этого срока трезвости. 90 минут оптимально для контроля лимита 10-12 шт. в день.
                </p>
              </div>
            </div>

            {/* Toggle animations checkbox */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 py-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <input
                  type="checkbox"
                  id="showSmokeEffect"
                  checked={showSmokeEffect}
                  onChange={(e) => setShowSmokeEffect(e.target.checked)}
                  className="w-4.5 h-4.5 accent-amber-500 rounded border-zinc-300 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="showSmokeEffect" className="text-xs font-medium text-zinc-600 cursor-pointer select-none">
                  Показывать красивый интерактивный дым при клике (можно отключить для экономии батареи)
                </label>
              </div>

              <div className="flex items-center gap-3 py-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <input
                  type="checkbox"
                  id="showFinancials"
                  checked={showFinancials}
                  onChange={(e) => setShowFinancials(e.target.checked)}
                  className="w-4.5 h-4.5 accent-amber-500 rounded border-zinc-300 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="showFinancials" className="text-xs font-medium text-zinc-600 cursor-pointer select-none">
                  Рассчитывать финансовую статистику (если вам не важны деньги, можете скрыть блоки расходов)
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить настройки</span>
            </button>
          </form>

          {/* Backup, Export & Import Block */}
          <div className="border-t border-zinc-100 pt-6">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Резервное копирование и перенос</h4>
            <div className="flex flex-wrap gap-3">
              {/* Export */}
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Скопировать резервный код</span>
              </button>

              {/* Import UI Toggle */}
              <button
                onClick={() => setShowImportArea(!showImportArea)}
                className="flex items-center gap-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Восстановить из кода</span>
              </button>
            </div>

            {showImportArea && (
              <form onSubmit={handleImportSubmit} className="mt-4 p-4 bg-zinc-50 rounded-xl space-y-3 border border-zinc-100">
                <p className="text-xs text-zinc-500">Вставьте скопированный ранее JSON-код резервной копии:</p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='{"settings":..., "logs":...}'
                  className="w-full text-xs font-mono h-24 bg-white border border-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                
                {importError && (
                  <p className="text-xs text-rose-500 font-semibold">{importError}</p>
                )}
                {importSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold">Данные успешно восстановлены!</p>
                )}

                <button
                  type="submit"
                  className="text-xs bg-zinc-800 hover:bg-zinc-950 text-white font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Применить данные
                </button>
              </form>
            )}
          </div>

          {/* Destructive Clear Zone */}
          <div className="border-t border-rose-100/50 pt-6">
            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between flex-wrap sm:flex-nowrap gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Опасная зона
                </h4>
                <p className="text-xs text-rose-700/80">Очистка всей истории сигарет и сброс настроек устройства безвозвратно.</p>
              </div>

              <button
                onClick={handleReset}
                onMouseLeave={() => setConfirmReset(false)}
                className={`text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
                  confirmReset
                    ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                    : 'bg-rose-100/60 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {confirmReset ? 'Вы уверены? Кликните снова!' : 'Сбросить все данные'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
