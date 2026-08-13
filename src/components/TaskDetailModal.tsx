import React from 'react';
import { Task, User } from '../types';
import {
  X,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Wrench,
  RotateCw,
  Video,
  Server,
  Key,
  Network,
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentUser: User | null;
  onOpenWorkReportModal: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleCheckitem?: (taskId: string, checkitemId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  currentUser,
  onOpenWorkReportModal,
  onDeleteTask,
  onToggleCheckitem,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Sticky Top */}
        <div className="shrink-0 bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono bg-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold text-white">
              №{task.id}
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-100">{task.title}</h3>
              <p className="text-xs text-blue-300 font-medium">Об'єкт: {task.location} (КУ "Центр-"077")</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 space-y-5 text-xs text-slate-800 overflow-y-auto flex-1">
          
          {/* Status & Priority Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Статус</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-md ${
                  task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {task.status === 'COMPLETED' ? '✅ Виконано' : task.status === 'IN_PROGRESS' ? '⏳ У роботі' : task.status === 'OVERDUE' ? '🚨 Прострочено' : '📅 Заплановано'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Пріоритет</span>
                <span className="font-bold text-slate-900">{task.priority}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Термін</span>
                <span className="font-bold text-slate-900">{task.dueDate} {task.dueTime || ''}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Підрядник</span>
              <span className="font-bold text-slate-900">{task.assignedContractorName}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Технічне Завдання / Інструкція:</h4>
            <p className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-xs">
              {task.description || 'Інструкція не вказана.'}
            </p>
          </div>

          {/* Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2">Чек-лист регламентних перевірок:</h4>
              <div className="space-y-1.5">
                {task.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleCheckitem && onToggleCheckitem(task.id, item.id)}
                    className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                      item.completed ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="font-bold text-[10px]">
                      {item.completed ? '✓ Перевірено' : '⏳ В очікуванні'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WORK REPORT SECTION IF COMPLETED */}
          {task.workReport && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Детальний Звіт Виконаної Роботи</span>
                </h4>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">
                  {new Date(task.workReport.completedAt).toLocaleString('uk-UA')}
                </span>
              </div>

              <p className="text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed font-semibold">
                {task.workReport.summary}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 bg-white rounded-lg border border-emerald-200">
                  <span className="text-slate-500 block">Затрачено часу</span>
                  <span className="font-bold text-slate-900">{task.workReport.timeSpentHours} год.</span>
                </div>

                <div className="p-2 bg-white rounded-lg border border-emerald-200">
                  <span className="text-slate-500 block">Замінені деталі / Запчастини</span>
                  <span className="font-bold text-slate-900">{task.workReport.partsReplaced || 'Немає'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {onDeleteTask && currentUser?.role === 'ADMIN' ? (
              <button
                onClick={() => {
                  onDeleteTask(task.id);
                  onClose();
                }}
                className="text-rose-600 hover:text-rose-800 font-bold text-xs"
              >
                Видалити заявку
              </button>
            ) : <div />}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition"
              >
                Закрити
              </button>

              {task.status !== 'COMPLETED' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenWorkReportModal(task);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Заповнити Звіт та Закрити Заявку</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
