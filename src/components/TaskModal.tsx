import React, { useState } from 'react';
import { Task, TaskCategory, TaskPriority, RecurringPattern, User, ChecklistItem } from '../types';
import { X, Plus, Trash2, Calendar, Clock, MapPin, AlertCircle, RotateCw, Video, Server, Key, Network, Edit3 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => void;
  users: User[];
  defaultDate?: string;
  customCategories?: string[];
  onAddCustomCategory?: (cat: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users,
  defaultDate,
  customCategories = [],
  onAddCustomCategory,
}) => {
  if (!isOpen) return null;

  const contractors = users.filter(u => u.role === 'CONTRACTOR');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('CCTV');
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCatInput, setShowAddCatInput] = useState(false);

  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [location, setLocation] = useState('Серверна №1 (КУ "Центр-"077")');
  const [assignedContractorId, setAssignedContractorId] = useState(contractors[0]?.id || users[0]?.id || '');
  const [dueDate, setDueDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('18:00');
  const [recurring, setRecurring] = useState<RecurringPattern>('MONTHLY');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: 'Перевірити напругу та заземлення обладнання', completed: false },
    { id: '2', label: 'Провести очищення повітрозабірників / скла камер від пилу', completed: false },
    { id: '3', label: 'Зняти логи роботи за попередній період', completed: false },
  ]);
  const [newChecklistLabel, setNewChecklistLabel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddChecklistItem = () => {
    if (!newChecklistLabel.trim()) return;
    setChecklist([
      ...checklist,
      { id: Date.now().toString(), label: newChecklistLabel.trim(), completed: false }
    ]);
    setNewChecklistLabel('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleAddNewCategory = () => {
    if (!newCatInput.trim()) return;
    if (onAddCustomCategory) {
      onAddCustomCategory(newCatInput.trim());
    }
    setCategory(newCatInput.trim());
    setNewCatInput('');
    setShowAddCatInput(false);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Будь ласка, вкажіть назву суті задачі');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Будь ласка, вкажіть термін виконання');
      return;
    }
    if (!assignedContractorId) {
      setErrorMsg('Оберіть підрядну організацію');
      return;
    }

    setErrorMsg('');
    onSubmit({
      title,
      description,
      category: category as TaskCategory,
      priority,
      location,
      assignedContractorId,
      dueDate,
      dueTime,
      recurring,
      checklist,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header - Sticky Top */}
        <div className="shrink-0 bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              +
            </div>
            <div>
              <h3 className="font-bold text-lg">Створення Задачі для Підрядника</h3>
              <p className="text-xs text-blue-300 font-medium">КУ "Центр-"077"</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form - Scrollable */}
        <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-sm text-slate-800 overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center space-x-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Назва задачі / Регламенту *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Наприклад: Профілактика ДБЖ та мікроклімату в Серверній №1"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Система / Фільтр *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCatInput(!showAddCatInput)}
                  className="text-[11px] text-blue-600 hover:underline font-bold"
                >
                  {showAddCatInput ? 'Скасувати' : '+ Створити свій фільтр'}
                </button>
              </div>

              {showAddCatInput ? (
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Назва власної системи..."
                    className="flex-1 px-3 py-1.5 border border-blue-400 rounded-lg text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
                  >
                    Додати
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="CCTV">📹 Відеоспостереження</option>
                  <option value="SERVER_ROOM">🖥 Серверна кімната</option>
                  <option value="ACCESS_CONTROL">🔑 СКУД та Замки</option>
                  <option value="NETWORK">🌐 Мережа / СКС</option>
                  {customCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      🏷️ {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Пріоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="LOW">⚪ Низький</option>
                <option value="MEDIUM">🔹 Середній</option>
                <option value="HIGH">⚡ Високий</option>
                <option value="URGENT">🚨 Аварійний виїзд</option>
              </select>
            </div>
          </div>

          {/* Location & Contractor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Об'єкт / Розташування
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder='Серверна №1 (КУ "Центр-"077")'
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Підрядник / Виконавець *
              </label>
              <select
                value={assignedContractorId}
                onChange={(e) => setAssignedContractorId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {users.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.fullName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time & Recurring Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Термін (Дата) *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Час
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                <RotateCw className="w-3 h-3 text-indigo-500" />
                <span>Періодичність</span>
              </label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as RecurringPattern)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="NONE">Разова робота</option>
                <option value="WEEKLY">Щотижня</option>
                <option value="BIWEEKLY">Кожні 2 тижні</option>
                <option value="MONTHLY">Щомісяця</option>
                <option value="QUARTERLY">Щокварталу</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Детальні завдання / Інструкції
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Вкажіть конкретні вимоги до огляду, марку обладнання та особливості..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Checklist */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-900 uppercase mb-2 flex items-center justify-between">
              <span>Конструктор чек-листа обов'язкових перевірок ({checklist.length})</span>
            </label>
            
            <div className="space-y-2 mb-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs">
                  <span className="font-medium text-slate-800">• {item.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-slate-400 hover:text-rose-500 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newChecklistLabel}
                onChange={(e) => setNewChecklistLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                placeholder="Додати свій пункт до чек-листа..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition"
              >
                + Додати пункт
              </button>
            </div>
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition"
            >
              Призначити та Повідомити
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
