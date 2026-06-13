/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Watch, Smartphone, Wifi, Bluetooth, Copy, Check, Code2, SmartphoneIcon, CircleHelp } from 'lucide-react';

interface WearOSSimulatorProps {
  todayCount: number;
  onSmokeFromWatch: () => void;
  dailyLimit: number;
}

type WearVersion = 'OS4' | 'OS5' | 'OS6';

export default function WearOSSimulator({
  todayCount,
  onSmokeFromWatch,
  dailyLimit
}: WearOSSimulatorProps) {
  const [wearVersion, setWearVersion] = useState<WearVersion>('OS6');
  const [activeTab, setActiveTab] = useState<'watch' | 'code' | 'help'>('watch');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'synced'>('connected');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [vibrate, setVibrate] = useState(false);

  // Trigger brief syncing layout when today's count changes (since someone clicked it on the phone or watch)
  useEffect(() => {
    setSyncStatus('syncing');
    const timer = setTimeout(() => {
      setSyncStatus('synced');
    }, 850);
    return () => clearTimeout(timer);
  }, [todayCount]);

  const handleWatchClick = () => {
    // Visual smartwatch vibration feedback
    setVibrate(true);
    setTimeout(() => {
      setVibrate(false);
    }, 200);

    // Call state modifier
    onSmokeFromWatch();
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Jetpack Compose 4/5/6 wearable templates
  const composeCode = `// Wear OS 4, 5, 6 Jetpack Compose Screen
@Composable
fun CigaretteCounterScreen(
    currentCount: Int,
    dailyLimit: Int,
    onAddCigarette: () => Unit
) {
    val progress = currentCount.toFloat() / dailyLimit.coerceAtLeast(1)
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colors.background),
        contentAlignment = Alignment.Center
    ) {
        // Wear Circular progress ring
        CircularProgressIndicator(
            progress = progress.coerceIn(0f, 1f),
            modifier = Modifier.fillMaxSize().padding(6dp),
            startAngle = 290f,
            endAngle = 250f,
            color = if (currentCount >= dailyLimit) Color.Red else Color.Green,
            strokeWidth = 5.dp
        )
        
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "СЕГОДНЯ",
                style = TextStyle(fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
            )
            Text(
                text = "$currentCount / $dailyLimit",
                style = TextStyle(fontSize = 28.sp, fontWeight = FontWeight.Black)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = onAddCigarette,
                colors = ButtonDefaults.buttonColors(backgroundColor = Color(0xFFFF9800)),
                modifier = Modifier.size(54.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Добавить затяжку"
                )
            }
        }
    }
}`;

  const tileCode = `// Wear OS Tile Provider for Watch Carousel (Wear OS 5 & 6)
class CounterTileService : TileService() {
    override fun onTileRequest(requestParams: TileRequestData): ListenableFuture<Tile> {
        val count = getCountFromRepository() // Reads shared local preferences
        return Futures.immediateFuture(Tile.Builder()
            .setResourcesVersion("1")
            .setTimeline(Timeline.Builder()
                .addTimelineEntry(TimelineEntry.Builder()
                    .setLayout(Layout.Builder()
                        .setRoot(LayoutElementBuilders.Column.Builder()
                            .addContent(LayoutElementBuilders.Text.Builder()
                                .setText("$count шт")
                                .setFontStyle(fontStyle)
                                .build())
                            .addContent(LayoutElementBuilders.Text.Builder()
                                .setText("Лимит превышен!")
                                .build())
                            .build())
                        .build())
                    .build())
                .build())
            .build())
    }
}`;

  const syncGuide = `// Bluetooth Synchronization via Wearable Data Client API (Samsung & Pixel Watch)
fun syncCigaretteToPhone(context: Context, newCount: Int) {
    val dataClient = Wearable.getDataClient(context)
    val putDataReq = PutDataMapRequest.create("/smoke_tracker/today").apply {
        dataMap.putInt("cigarette_count", newCount)
        dataMap.putLong("timestamp", System.currentTimeMillis())
    }.asPutDataRequest().setUrgent()
    
    dataClient.putDataItem(putDataReq)
        .addOnSuccessListener { Log.d("WearOS", "Успешно отправлено на мобильное устройство!") }
        .addOnFailureListener { e -> Log.e("WearOS", "Ошибка Bluetooth соединения", e) }
}`;

  // Progress to today's limit
  const watchProgress = Math.min(100, Math.round((todayCount / dailyLimit) * 100));

  return (
    <div id="wearos-simulator-card" className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
      {/* Emulator Header */}
      <div className="bg-zinc-900 text-white px-6 py-4 flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Watch className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold tracking-tight">Wear OS 4, 5, 6 Интеграция</h3>
            <p className="text-[10px] text-zinc-400 font-medium">Беспроводная синхронизация с часами</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-zinc-800 p-1 rounded-xl text-xs gap-1">
          <button
            onClick={() => setActiveTab('watch')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeTab === 'watch' ? 'bg-amber-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Симулятор
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeTab === 'code' ? 'bg-amber-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Исходный код
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeTab === 'help' ? 'bg-amber-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Инструкция
          </button>
        </div>
      </div>

      {/* Main interactive screen */}
      <div className="p-6 bg-zinc-50 flex-1">
        {activeTab === 'watch' && (
          <div className="flex flex-col lg:flex-row items-center justify-around gap-8 py-4">
            {/* Round Watch body */}
            <div className="relative">
              {/* Outer physical rotating bezel rim */}
              <motion.div
                animate={vibrate ? { x: [0, -3, 3, -3, 3, 0], y: [0, 2, -2, 2, -2, 0] } : {}}
                transition={{ duration: 0.2 }}
                className="w-64 h-64 rounded-full bg-zinc-950 border-[10px] border-zinc-800 flex items-center justify-center relative shadow-2xl overflow-hidden ring-4 ring-zinc-900/5"
              >
                {/* Watch screen glass shimmer */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />

                {/* Inner circular interface relative to selected OS */}
                <div className="w-full h-full rounded-full p-6 flex flex-col justify-between items-center text-center relative text-white">
                  {/* Top: Watch Header Status */}
                  <div className="flex items-center gap-1 mt-1 z-10">
                    <Bluetooth className="w-3 h-3 text-sky-400" />
                    <span className="text-[9px] text-zinc-400 font-mono tracking-tight uppercase">СИНХР</span>
                    <Wifi className="w-3 h-3 text-emerald-400" />
                  </div>

                  {/* Wear OS Version branding backgrounds */}
                  {wearVersion === 'OS4' && (
                    <div className="flex flex-col items-center justify-center my-auto z-10">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">CИГАРЕТЫ</span>
                      <span className="text-3xl font-black">{todayCount}</span>
                      <span className="text-[10px] text-zinc-400 mt-1">лимит {dailyLimit} шт.</span>
                    </div>
                  )}

                  {wearVersion === 'OS5' && (
                    <div className="flex flex-col items-center justify-center my-auto z-10 relative w-full h-32">
                      {/* Radial Progress Ring background */}
                      <svg className="absolute w-28 h-28 transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="44"
                          className="stroke-zinc-800/80 fill-none"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="56"
                          cy="56"
                          r="44"
                          className="stroke-amber-400 fill-none"
                          strokeWidth="8"
                          strokeDasharray={276}
                          animate={{ strokeDashoffset: 276 - (276 * watchProgress) / 100 }}
                          transition={{ duration: 0.6 }}
                        />
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black">{todayCount}</span>
                        <span className="text-[9px] text-zinc-400 mt-0.5">выкурено</span>
                      </div>
                    </div>
                  )}

                  {wearVersion === 'OS6' && (
                    <div className="flex flex-col items-center justify-center my-auto z-10 w-full px-2">
                      {/* Smart aesthetic compilation dials for OS6 layout */}
                      <div className="flex gap-2 mb-2">
                        <span className="text-[8px] bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700/50 text-zinc-300">
                          ВРЕМЯ: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full text-white ${
                          todayCount >= dailyLimit ? 'bg-rose-900 border border-rose-700' : 'bg-emerald-950 border border-emerald-800'
                        }`}>
                          {todayCount >= dailyLimit ? 'ОПАСНО' : 'В НОРМЕ'}
                        </span>
                      </div>
                      
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-amber-400">{todayCount}</span>
                        <span className="text-xs text-zinc-500">/ {dailyLimit}шт</span>
                      </div>

                      <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            todayCount >= dailyLimit ? 'bg-rose-500' : 'bg-amber-400'
                          }`}
                          style={{ width: `${watchProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom widget tap button */}
                  <div className="flex flex-col items-center z-10 mb-1">
                    <button
                      onClick={handleWatchClick}
                      className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white flex items-center justify-center cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 transition-all text-lg font-black shrink-0 relative"
                    >
                      +1
                    </button>
                    <span className="text-[8px] text-amber-500 font-semibold tracking-wider uppercase mt-1">Тяга</span>
                  </div>
                </div>

                {/* Micro-indicators/ticks along screen bezel */}
                <span className="absolute top-2 w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span className="absolute left-2 w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-zinc-700" />
              </motion.div>

              {/* Connected physical strap loops behind watch body */}
              <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 w-28 h-[30px] bg-zinc-800/40 rounded-t-xl -z-10 border-t border-x border-zinc-700/20" />
              <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-28 h-[30px] bg-zinc-800/40 rounded-b-xl -z-10 border-b border-x border-zinc-700/20" />
            </div>

            {/* Control Column & Settings for Watch face */}
            <div className="space-y-4 max-w-sm">
              <div className="space-y-1">
                <span className="text-[10px] bg-zinc-200 text-zinc-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Интерактивное сопряжение
                </span>
                <h4 className="text-zinc-950 font-bold text-base mt-2">Проверьте Wear OS на деле!</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Нажмите на кнопку <strong>+1</strong> на симуляторе умных часов. Вы увидите, как затяжка моментально запишется в базу данных телефона и обновит статистику в панелях слева и справа в режиме реального времени!
                </p>
              </div>

              {/* Wear OS Version Selector */}
              <div className="bg-white p-3 rounded-2xl border border-zinc-100 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-zinc-600">Эстетика циферблата:</span>
                <div className="flex gap-1">
                  {(['OS4', 'OS5', 'OS6'] as WearVersion[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setWearVersion(v)}
                      className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer ${
                        wearVersion === v
                          ? 'bg-zinc-800 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {v === 'OS4' ? 'OS 4' : v === 'OS5' ? 'OS 5' : 'OS 6'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Device Bluetooth status */}
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Bluetooth className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">Bluetooth канал:</span>
                </div>
                
                <span className="font-bold uppercase tracking-wide px-2.5 py-0.5 bg-blue-100/80 rounded-full text-[10px] text-blue-700">
                  {syncStatus === 'connected' && 'Подключено'}
                  {syncStatus === 'syncing' && 'Синхронизация...'}
                  {syncStatus === 'synced' && 'Данные синхронны!'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Developer codes page representing ready solutions */}
        {activeTab === 'code' && (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            <p className="text-xs text-zinc-600">
              Ниже приведены реальные программные блоки для сборки мобильного приложения на смарт-часы <strong>Wear OS 4, 5, 6</strong> в среде Android Studio. Использован современный инструментарий Jetpack Compose и Wearable Services.
            </p>

            {/* Jetpack Compose UI */}
            <div className="bg-zinc-950 text-zinc-300 rounded-2xl p-4 relative font-mono text-xs overflow-x-auto">
              <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-2 text-[10px]">
                <span className="text-zinc-500">CIGARETTE_SCREEN.KT (COMPOSE Wear UI)</span>
                <button
                  onClick={() => handleCopyCode('compose', composeCode)}
                  className="flex items-center gap-1 hover:text-white cursor-pointer"
                >
                  {copiedId === 'compose' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'compose' ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
              <pre>{composeCode}</pre>
            </div>

            {/* Wear OS Tiles */}
            <div className="bg-zinc-950 text-zinc-300 rounded-2xl p-4 relative font-mono text-xs overflow-x-auto">
              <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-2 text-[10px]">
                <span className="text-zinc-500">COUNTER_TILE_SERVICE.KT (Wear OS 5 / 6 Tiles)</span>
                <button
                  onClick={() => handleCopyCode('tile', tileCode)}
                  className="flex items-center gap-1 hover:text-white cursor-pointer"
                >
                  {copiedId === 'tile' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'tile' ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
              <pre>{tileCode}</pre>
            </div>

            {/* Phone Wearable Client */}
            <div className="bg-zinc-950 text-zinc-300 rounded-2xl p-4 relative font-mono text-xs overflow-x-auto">
              <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-2 text-[10px]">
                <span className="text-zinc-500">BLUETOOTH_SYNC.KT (DataClient API Client-Sync)</span>
                <button
                  onClick={() => handleCopyCode('sync', syncGuide)}
                  className="flex items-center gap-1 hover:text-white cursor-pointer"
                >
                  {copiedId === 'sync' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'sync' ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
              <pre>{syncGuide}</pre>
            </div>
          </div>
        )}

        {/* Instructions */}
        {activeTab === 'help' && (
          <div className="space-y-4 text-xs text-zinc-700 leading-relaxed">
            <h4 className="text-sm font-bold text-zinc-900">Инструкция по сопряжению часов на Wear OS 4, 5, 6:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="p-4 bg-white rounded-2xl border border-zinc-100 flex flex-col gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">1</span>
                <span className="font-bold text-zinc-800">Создание проекта</span>
                <p className="text-zinc-500">Откройте Android Studio, создайте проект с шаблоном <strong>New Wear OS App with Compose</strong>. Добавьте Gradle-зависимость: <code className="font-mono text-[10px] bg-zinc-100 px-1 py-0.5 rounded">play-services-wearable</code>.</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-zinc-100 flex flex-col gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">2</span>
                <span className="font-bold text-zinc-800">Передача по Bluetooth</span>
                <p className="text-zinc-500">Используйте <strong>DataClient API</strong> как в коде во второй вкладке. Данные моментально полетят через защищенный канал в сопряженный Android-телефон.</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-zinc-100 flex flex-col gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">3</span>
                <span className="font-bold text-zinc-800">Добавление на плитку</span>
                <p className="text-zinc-500">Реализуйте класс <code className="font-mono text-[10px] bg-zinc-100 px-1.5 py-0.5">TileService</code> для карусели быстрого доступа часов, чтобы видеть баланс не открывая самого приложения!</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50 flex gap-2.5 items-start mt-3">
              <CircleHelp className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900">Полезно знать разработчику:</span>
                <p className="text-amber-800/80 mt-1">
                  Наш симулятор выше полностью синхронизирован на уровне React стейта. Каждое нажатие кнопки в симуляторе часов срабатывает точно так же, как если бы вы затянулись и добавили сигарету на самом телефоне! Испытайте его в действии.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
