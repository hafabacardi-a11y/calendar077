import React, { useState } from 'react';
import { Task, WorkReport, User } from '../types';
import { X, CheckCircle2, Sparkles, Clock, Wrench, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

interface WorkReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentUser: User | null;
  onSubmitReport: (taskId: string, reportData: Partial<WorkReport>) => void;
}

export const WorkReportModal: React.FC<WorkReportModalProps> = ({
  isOpen,
  onClose,
  task,
  currentUser,
  onSubmitReport,
}) => {
  if (!isOpen || !task) return null;

  const [summary, setSummary] = useState('');
  const [equipmentCheckedStr, setEquipmentCheckedStr] = useState(
    task.category === 'SERVER_ROOM'
      ? 'ДБЖ Eaton, Шафа СКУД, Кондиціонер Daikin, Сервер NVR'
      : 'Поворотні камери Hikvision, Гермовводи, Сервер відеозапису'
  );
  const [partsReplaced, setPartsReplaced] = useState('');
  const [timeSpentHours, setTimeSpentHours] = useState('2.0');
  const [statusRating, setStatusRating] = useState<'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION'>('EXCELLENT');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAiEnhance = async () => {
    if (!summary.trim()) {
      setErrorMsg('Напишіть декілька слів у полі звіту перед покращенням через ШІ.');
      return;
    }

    setIsAiLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/enhance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNotes: summary,
          category: task.category,
          location: task.location,
        }),
      });

      const data = await res.json();
      if (data.enhancedText) {
        setSummary(data.enhancedText);
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg('Не вдалося зв’язатися з ШІ сервісом: ' + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || summary.length < 10) {
      setErrorMsg('Будь ласка, напишіть детальний звіт про виконану роботу (мінімум 10 символів).');
      return;
    }

    const equipmentChecked = equipmentCheckedStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmitReport(task.id, {
      summary,
      equipmentChecked,
      partsReplaced,
      timeSpentHours: parseFloat(timeSpentHours) || 1,
      statusRating,
      completedBy: currentUser?.fullName || 'Інженер підрядника',
      contractorCompany: currentUser?.company || task.assignedContractorName,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Fixed Top */}
        <div className="shrink-0 bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Детальний Звіт про Виконану Роботу</h3>
              <p className="text-xs text-emerald-100 font-medium">Закриття заявки №{task.id} (КУ "Центр-"077") та сповіщення в Telegram</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-emerald-200 hover:text-white rounded-lg transition font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-800 overflow-y-auto flex-1">
          
          {/* Task Recap Info */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-900 text-sm">{task.title}</div>
            <div className="text-slate-600">
              Об'єкт: <b>{task.location}</b> | Виконавець: <b>{currentUser?.company || task.assignedContractorName}</b>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center space-x-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Work Summary Field with AI Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Опис виконаної роботи *
              </label>
              <button
                type="button"
                onClick={handleAiEnhance}
                disabled={isAiLoading}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-md border border-indigo-200 flex items-center space-x-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isAiLoading ? 'Генерація...' : '✨ Покращити через Gemini AI'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Детально опишіть виконані дії (наприклад: Проведено заміну фільтрів кондиціонера, виміряно ємність акумуляторів ДБЖ під навантаженням, замінено термопасту на серверах...)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium"
            />
          </div>

          {/* Equipment Checked & Parts Replaced */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Перевірене обладнання (через кому)
              </label>
              <input
                type="text"
                value={equipmentCheckedStr}
                onChange={(e) => setEquipmentCheckedStr(e.target.value)}
                placeholder="ДБЖ Eaton, NVR відеосервер, камери"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Замінені запчастини / Деталі (за наявності)
              </label>
              <input
                type="text"
                value={partsReplaced}
                onChange={(e) => setPartsReplaced(e.target.value)}
                placeholder="Наприклад: Акумулятор Delta 12V 12Ah, Запобіжник 5A"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Time spent & Condition Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Затрачено часу (годин)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={timeSpentHours}
                onChange={(e) => setTimeSpentHours(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Оцінка стану об'єкта</span>
              </label>
              <select
                value={statusRating}
                onChange={(e) => setStatusRating(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="EXCELLENT">🟢 Відмінно (Зауважень немає)</option>
                <option value="GOOD">🟡 У нормі (Справно)</option>
                <option value="NEEDS_ATTENTION">🔴 Потребує уваги / Ремонт</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Після відправки звіту статус заявки зміниться на <b>«Виконано»</b>, а детальний звіт буде надіслано в <b>Telegram Бот</b>.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Закрити заявку та Надіслати Звіт</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
