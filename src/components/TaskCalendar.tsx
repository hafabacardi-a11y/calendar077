import React, { useState } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus, User } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Server,
  Key,
  Network,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Calendar as CalendarIcon,
  ListFilter,
  FileCheck2,
  Building2,
  AlertTriangle,
  RotateCw,
  Tag
} from 'lucide-react';

interface TaskCalendarProps {
  tasks: Task[];
  users: User[];
  currentUser: User | null;
  onOpenCreateTaskModal: (dateStr?: string) => void;
  onSelectTask: (task: Task) => void;
  customCategories?: string[];
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  users,
  currentUser,
  onOpenCreateTaskModal,
  onSelectTask,
  customCategories = [],
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedContractor, setSelectedContractor] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthNamesUa = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  // Days in current month grid calculation
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Day of week offset (0 = Sunday, 1 = Monday, etc. Adjust so Monday = 0)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

  const daysGrid: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(new Date(year, month, d));
  }

  // Filter tasks based on search criteria
  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    if (selectedContractor !== 'ALL' && t.assignedContractorId !== selectedContractor) return false;
    return true;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'CCTV':
        return <Video className="w-3.5 h-3.5 text-blue-500" />;
      case 'SERVER_ROOM':
        return <Server className="w-3.5 h-3.5 text-indigo-500" />;
      case 'ACCESS_CONTROL':
        return <Key className="w-3.5 h-3.5 text-amber-500" />;
      case 'NETWORK':
        return <Network className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'CCTV': return 'Відеоспостереження';
      case 'SERVER_ROOM': return 'Серверна кімната';
      case 'ACCESS_CONTROL': return 'СКУД та Замки';
      case 'NETWORK': return 'Мережі/СКС';
      default: return cat;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-md flex items-center space-x-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Виконано</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded-md flex items-center space-x-1 font-semibold">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" />
            <span>У роботі</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2 py-0.5 rounded-md flex items-center space-x-1 font-semibold">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Прострочено</span>
          </span>
        );
      case 'SCHEDULED':
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs px-2 py-0.5 rounded-md flex items-center space-x-1 font-semibold">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Заплановано</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">🚨 Аварія</span>;
      case 'HIGH':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Високий</span>;
      case 'MEDIUM':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Середній</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">Низький</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter & Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Calendar Month Navigation */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white rounded-md text-slate-600 transition"
                title="Попередній місяць"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 font-bold text-sm text-slate-800 hover:bg-white rounded-md transition min-w-[120px] text-center"
                title="Перейти до поточного місяця"
              >
                {monthNamesUa[month]} {year}
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white rounded-md text-slate-600 transition"
                title="Наступний місяць"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition"
            >
              Сьогодні
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                КУ «Центр-077»
              </h2>
              <span className="text-xs text-slate-500 font-medium">Календар та графік робіт</span>
            </div>
          </div>

          {/* Action Buttons: Create Task & View Toggle */}
          <div className="flex items-center space-x-3">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('GRID')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition ${
                  viewMode === 'GRID' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Сітка Календаря</span>
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition ${
                  viewMode === 'LIST' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Список Задач</span>
              </button>
            </div>

            <button
              onClick={() => onOpenCreateTaskModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Створити Задачу</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs font-medium">
          <div className="flex items-center space-x-2 text-slate-500 font-bold">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Фільтри:</span>
          </div>

          {/* System Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">Усі системи (Відео, Серверна, СКУД...)</option>
            <option value="CCTV">📹 Відеоспостереження</option>
            <option value="SERVER_ROOM">🖥 Серверна кімната</option>
            <option value="ACCESS_CONTROL">🔑 СКУД та Замки</option>
            <option value="NETWORK">🌐 СКС та Мережі</option>
            {customCategories.map((cat) => (
              <option key={cat} value={cat}>
                🏷️ {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">Усі статуси</option>
            <option value="SCHEDULED">Заплановано</option>
            <option value="IN_PROGRESS">У роботу</option>
            <option value="COMPLETED">Виконано</option>
            <option value="OVERDUE">Прострочено</option>
          </select>

          {/* Contractor Filter */}
          <select
            value={selectedContractor}
            onChange={(e) => setSelectedContractor(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">Усі підрядники</option>
            {users
              .filter((u) => u.role === 'CONTRACTOR')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.fullName})
                </option>
              ))}
          </select>

          {(selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedContractor !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
                setSelectedContractor('ALL');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline font-bold"
            >
              Скинути фільтри
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: GRID CALENDAR */}
      {viewMode === 'GRID' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-xs py-2 text-center uppercase tracking-wider">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div className="text-rose-600">Сб</div>
            <div className="text-rose-600">Нд</div>
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-50">
            {daysGrid.map((dateObj, idx) => {
              if (!dateObj) {
                return <div key={`empty-${idx}`} className="bg-slate-100/50 min-h-[120px] p-2" />;
              }

              const dateStr = dateObj.toISOString().split('T')[0];
              const isToday = new Date().toISOString().split('T')[0] === dateStr;
              const dayNum = dateObj.getDate();

              // Get tasks for this date
              const dayTasks = filteredTasks.filter((t) => t.dueDate === dateStr);

              return (
                <div
                  key={dateStr}
                  className={`min-h-[130px] p-2 bg-white transition hover:bg-slate-50 flex flex-col justify-between group ${
                    isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''
                  }`}
                >
                  <div>
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>

                      <button
                        onClick={() => onOpenCreateTaskModal(dateStr)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 font-bold"
                        title="Додати задачу на цю дату"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Day Task Cards */}
                    <div className="space-y-1.5">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onSelectTask(t)}
                          className={`p-1.5 rounded-lg border text-left cursor-pointer transition shadow-2xs hover:shadow-md ${
                            t.status === 'COMPLETED'
                              ? 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-300'
                              : t.priority === 'URGENT'
                              ? 'bg-rose-50 border-rose-300 hover:border-rose-400'
                              : 'bg-white border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 line-clamp-1">
                            <span className="flex items-center space-x-1 truncate">
                              {getCategoryIcon(t.category)}
                              <span className="truncate">{t.title}</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                            <span className="truncate max-w-[90px] font-medium">{t.assignedContractorName.split('(')[0]}</span>
                            <span className="font-mono text-slate-600 font-bold">{t.dueTime || ''}</span>
                          </div>

                          {t.recurring !== 'NONE' && (
                            <div className="mt-1 flex items-center space-x-1 text-[9px] text-indigo-600 font-bold">
                              <RotateCw className="w-2.5 h-2.5" />
                              <span>Регламент ({t.recurring})</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {dayTasks.length === 0 && (
                    <div
                      onClick={() => onOpenCreateTaskModal(dateStr)}
                      className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-[10px] text-slate-400 hover:text-blue-600 font-bold"
                    >
                      + Призначити
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: DETAILED LIST VIEW */}
      {viewMode === 'LIST' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center justify-between">
            <span>Список активних та виконаних задач ({filteredTasks.length})</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium">
                Задачі за обраними фільтрами не знайдені.
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {getCategoryIcon(t.category)}
                        <span>{getCategoryLabel(t.category)}</span>
                      </span>
                      {getPriorityBadge(t.priority)}
                      {t.recurring !== 'NONE' && (
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold border border-indigo-200 flex items-center space-x-1">
                          <RotateCw className="w-2.5 h-2.5" />
                          <span>Періодичність: {t.recurring}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{t.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2">{t.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Виконавець: <b>{t.assignedContractorName}</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right text-xs space-y-1">
                      <div className="font-bold text-slate-800">
                        Термін: {t.dueDate} {t.dueTime || ''}
                      </div>
                      <div>{getStatusBadge(t.status)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
