import React from 'react';
import { User } from '../types';
import { Calendar, ShieldAlert, Bot, FileCode2, User as UserIcon, LogOut, CheckCircle2, Clock, AlertTriangle, LogIn } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'calendar' | 'admin' | 'telegram' | 'php' | 'profile';
  setActiveTab: (tab: 'calendar' | 'admin' | 'telegram' | 'php' | 'profile') => void;
  onLogout: () => void;
  onLoginClick: () => void;
  activeTasksCount: number;
  overdueTasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onLoginClick,
  activeTasksCount,
  overdueTasksCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">Календар Задач</span>
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-500/30">
                  КУ "Центр-"077"
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Контроль підрядників та ТО відеоспостереження / серверної
              </p>
            </div>
          </div>

          {/* KPI Pills */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">Активних задач:</span>
              <span className="font-bold text-amber-400">{activeTasksCount}</span>
            </div>

            {overdueTasksCount > 0 ? (
              <div className="flex items-center space-x-1.5 bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Прострочено:</span>
                <span className="font-bold text-rose-400">{overdueTasksCount}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Усі терміни в нормі</span>
              </div>
            )}
          </div>

          {/* User Profile & Role Dropdown */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-200">{currentUser.fullName}</div>
                  <div className="text-xs text-slate-400 flex items-center justify-end space-x-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${currentUser.role === 'ADMIN' ? 'bg-purple-400' : 'bg-emerald-400'}`}></span>
                    <span>{currentUser.company} ({currentUser.role === 'ADMIN' ? 'Замовник/Адмін' : 'Підрядник'})</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition"
                  title="Мій профіль та Користувачі"
                >
                  <UserIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  title="Вийти з аккаунту"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Увійти в систему</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/80 text-sm font-medium no-scrollbar">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Календар Задач</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Панель Управління</span>
            {overdueTasksCount > 0 && (
              <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                {overdueTasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'telegram'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Telegram Бот та Сповіщення</span>
          </button>

          <button
            onClick={() => setActiveTab('php')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'php'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>PHP & MySQL Код</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

