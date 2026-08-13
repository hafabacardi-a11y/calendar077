import React, { useState } from 'react';
import { TelegramConfig, TelegramLog } from '../types';
import {
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  Bell,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Info,
  Terminal,
  FileCode2
} from 'lucide-react';

interface TelegramPanelProps {
  config: TelegramConfig;
  logs: TelegramLog[];
  onSaveConfig: (newConfig: TelegramConfig) => Promise<void>;
  onTestPing: () => Promise<any>;
}

export const TelegramPanel: React.FC<TelegramPanelProps> = ({
  config,
  logs,
  onSaveConfig,
  onTestPing,
}) => {
  const [botToken, setBotToken] = useState(config.botToken || '');
  const [chatId, setChatId] = useState(config.chatId || '');
  const [channelName, setChannelName] = useState(config.channelName || '@Center077_Bot');
  const [enabled, setEnabled] = useState(config.enabled ?? true);
  const [notifyNewTask, setNotifyNewTask] = useState(config.notifyNewTask ?? true);
  const [notifyUpcomingTask, setNotifyUpcomingTask] = useState(config.notifyUpcomingTask ?? true);
  const [notifyCloseReport, setNotifyCloseReport] = useState(config.notifyCloseReport ?? true);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      await onSaveConfig({
        botToken,
        chatId,
        channelName,
        enabled,
        notifyNewTask,
        notifyUpcomingTask,
        notifyCloseReport,
      });
      setStatusMsg({ text: 'Налаштування Telegram-бота успішно збережено!', type: 'success' });
    } catch (err: any) {
      setStatusMsg({ text: 'Помилка збереження: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestPing = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await onTestPing();
      if (res.simulated) {
        setStatusMsg({
          text: 'Тестове сповіщення симульовано в консолі нижче (для реальної відправки в Telegram вкажіть Bot Token та Chat ID).',
          type: 'success',
        });
      } else if (res.success) {
        setStatusMsg({
          text: 'Повідомлення успішно відправлено у ваш Telegram бот/чат!',
          type: 'success',
        });
      } else {
        setStatusMsg({
          text: `Помилка відправки в Telegram: ${res.error || 'Невідома помилка'}`,
          type: 'error',
        });
      }
    } catch (err: any) {
      setStatusMsg({ text: 'Помилка тестового пінга: ' + err.message, type: 'error' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Інтеграція з Telegram Бот та Каналом Сповіщень</h2>
            <p className="text-xs text-sky-100 font-medium">
              Миттєві сповіщення про нові заявки, наближення термінів та детальні звіти підрядників КУ "Центр-"077"
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Конфігурація Telegram API</span>
          </h3>

          {statusMsg && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs text-slate-800">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Приклад: 123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Отримайте у @BotFather в Telegram</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Chat ID / Channel ID
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Приклад: -100123456789 або ID чату"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">ID вашої групи або особистого чату</span>
              </div>
            </div>

            {/* Notification Checkboxes */}
            <div className="pt-2 space-y-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 uppercase block mb-1">Типи активних сповіщень:</label>

              <label className="flex items-center space-x-2 text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyNewTask}
                  onChange={(e) => setNotifyNewTask(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>📩 <b>Нова задача:</b> Сповіщення підряднику про призначення заявки з об'єктом та терміном</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyUpcomingTask}
                  onChange={(e) => setNotifyUpcomingTask(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>⏰ <b>Нагадування:</b> Нагадування за 24г до закінчення терміну виконання</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyCloseReport}
                  onChange={(e) => setNotifyCloseReport(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>📋 <b>Детальний звіт при закритті:</b> Повний звіт інженера із заміненими вузлами</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestPing}
                disabled={testing}
                className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded-lg border border-sky-200 flex items-center space-x-2 transition"
              >
                <Send className="w-4 h-4 text-sky-600" />
                <span>{testing ? 'Надсилання...' : 'Надіслати Тестовий Пінґ в Telegram'}</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition"
              >
                {saving ? 'Збереження...' : 'Зберегти Налаштування'}
              </button>
            </div>
          </form>
        </div>

        {/* Telegram Template Explainer & Guide */}
        <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Info className="w-4 h-4 text-sky-400" />
            <span>Інструкція та Формат Сповіщень</span>
          </h3>

          <div className="space-y-3 text-slate-300">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
              <p className="font-bold text-sky-400 mb-1">Як підключити свого Telegram-бота:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>Вiдкрийте Telegram та знайдіть бота <b>@BotFather</b></li>
                <li>Створіть нового бота командою <code>/newbot</code></li>
                <li>Скопіюйте отриманий <b>HTTP API Token</b> у форму зліва</li>
                <li>Додайте бота у ваш чат/канал та надішліть будь-яке повідомлення</li>
                <li>Дізнайтеся ID чату через <b>@userinfobot</b> та вкажіть його</li>
              </ol>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <span className="font-bold text-emerald-400 block">Приклад підсумкового звіту в Telegram:</span>
              <p className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
{`✅ ДЕТАЛЬНИЙ ЗВІТ ПО ЗАКРИТІЙ ЗАЯВЦІ

📌 Заявка №task_100: Аудит СКУД
📍 Серверна №1 (КУ "Центр-"077")
👷 Виконавець: ТОВ "ІнфоТех Сервіс"
⏱ Затрачено: 2.5 год.
⭐ Стан: 🟢 Відмінно

📋 ОПИС ВИКОНАНОЇ РОБОТИ:
Проведено запуск акумуляторів ДБЖ.
Замінено блок живлення ББЖ-30.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Console Logs Stream */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Лоґ Надсилання Telegram-Сповіщень</span>
          </h3>

          <span className="text-xs text-slate-400 font-mono">Усього записів: {logs.length}</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-center py-4 font-sans">Лоґ порожній.</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-800/90 border border-slate-700/80 flex items-start justify-between gap-4 text-[11px]"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString('uk-UA')}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.type === 'WORK_REPORT'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.type === 'NEW_TASK'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {log.type}
                    </span>
                    <span className="text-slate-400">Отримувач: {log.recipient}</span>
                  </div>
                  <div className="text-slate-300 font-sans">{log.messageSnippet}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    log.status === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : log.status === 'SIMULATED'
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {log.status === 'SUCCESS' ? 'НАДІСЛАНО' : log.status === 'SIMULATED' ? 'СИМУЛЯЦІЯ' : 'ПОМИЛКА'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
