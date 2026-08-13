import React, { useEffect, useState } from 'react';
import { Task, User, TelegramConfig, TelegramLog, WorkReport, TaskStatus } from './types';
import { Navbar } from './components/Navbar';
import { TaskCalendar } from './components/TaskCalendar';
import { AdminDashboard } from './components/AdminDashboard';
import { TelegramPanel } from './components/TelegramPanel';
import { PhpCodeCenter } from './components/PhpCodeCenter';
import { TaskModal } from './components/TaskModal';
import { WorkReportModal } from './components/WorkReportModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'calendar' | 'admin' | 'telegram' | 'php' | 'profile'>('calendar');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>(['Клімат та ДБЖ']);

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    botToken: '',
    chatId: '',
    channelName: '@Center077_Bot',
    enabled: true,
    notifyNewTask: true,
    notifyUpcomingTask: true,
    notifyCloseReport: true,
  });
  const [telegramLogs, setTelegramLogs] = useState<TelegramLog[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalDefaultDate, setTaskModalDefaultDate] = useState<string | undefined>(undefined);

  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedTaskForReport, setSelectedTaskForReport] = useState<Task | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Initial Check Session & Fetch Data
  useEffect(() => {
    // Check saved session in localStorage/sessionStorage
    const savedUser = localStorage.getItem('center077_user') || sessionStorage.getItem('center077_user');
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        if (userObj && userObj.id) {
          setCurrentUser(userObj);
          setIsAuthModalOpen(false);
        } else {
          setIsAuthModalOpen(true);
        }
      } catch (e) {
        setIsAuthModalOpen(true);
      }
    } else {
      setIsAuthModalOpen(true);
    }

    fetchTasks();
    fetchUsers();
    fetchTelegramConfig();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchTelegramConfig = async () => {
    try {
      const res = await fetch('/api/telegram/config');
      const data = await res.json();
      if (data.config) {
        setTelegramConfig(data.config);
      }
      if (data.logs) {
        setTelegramLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching telegram config:', err);
    }
  };

  // Handlers
  const handleLoginSuccess = (user: User, remember: boolean) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    if (remember) {
      localStorage.setItem('center077_user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('center077_user', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('center077_user');
    sessionStorage.removeItem('center077_user');
    setIsAuthModalOpen(true);
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          createdById: currentUser?.id || 'usr_admin',
          createdByName: currentUser?.fullName || 'Адміністратор КУ "Центр-"077"',
        }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        setTasks(prev => [data.task, ...prev]);
        fetchTelegramConfig(); // Refresh telegram logs
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleAddCustomCategory = (categoryName: string) => {
    if (categoryName && !customCategories.includes(categoryName)) {
      setCustomCategories(prev => [...prev, categoryName]);
    }
  };

  const handleToggleCheckitem = async (taskId: string, checkitemId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask || !targetTask.checklist) return;

    const updatedChecklist = targetTask.checklist.map(item =>
      item.id === checkitemId ? { ...item, completed: !item.completed } : item
    );

    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, checklist: updatedChecklist } : t))
    );

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail({
        ...selectedTaskForDetail,
        checklist: updatedChecklist,
      });
    }

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: updatedChecklist }),
      });
    } catch (err) {
      console.error('Error toggling checklist:', err);
    }
  };

  const handleCompleteTaskWithReport = async (taskId: string, reportData: Partial<WorkReport>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportData,
          completedBy: currentUser?.fullName || 'Інженер',
          contractorCompany: currentUser?.company || 'Підрядна організація',
        }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t));
        fetchTelegramConfig(); // Refresh logs
      }
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t));
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleAddUser = async (newUser: any) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    if (data.success && data.user) {
      setUsers(prev => [...prev, data.user]);
    } else {
      throw new Error(data.error || 'Не вдалося створити користувача');
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem('center077_user', JSON.stringify(updatedUser));
  };

  const handleSaveTelegramConfig = async (newConfig: TelegramConfig) => {
    try {
      const res = await fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (data.config) {
        setTelegramConfig(data.config);
      }
    } catch (err) {
      console.error('Error saving telegram config:', err);
    }
  };

  const handleTestTelegramPing = async () => {
    const res = await fetch('/api/telegram/test-ping', { method: 'POST' });
    const data = await res.json();
    fetchTelegramConfig(); // Refresh logs
    return data;
  };

  const activeTasksCount = tasks.filter(t => t.status !== 'COMPLETED').length;
  const overdueTasksCount = tasks.filter(t => t.status === 'OVERDUE').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased pb-16">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        activeTasksCount={activeTasksCount}
        overdueTasksCount={overdueTasksCount}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {activeTab === 'calendar' && (
          <TaskCalendar
            tasks={tasks}
            users={users}
            currentUser={currentUser}
            customCategories={customCategories}
            onOpenCreateTaskModal={(dateStr) => {
              setTaskModalDefaultDate(dateStr);
              setIsTaskModalOpen(true);
            }}
            onSelectTask={(task) => {
              setSelectedTaskForDetail(task);
              setIsDetailModalOpen(true);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            tasks={tasks}
            users={users}
            customCategories={customCategories}
            onSelectTask={(task) => {
              setSelectedTaskForDetail(task);
              setIsDetailModalOpen(true);
            }}
            onQuickStatusChange={handleQuickStatusChange}
            onRefreshData={fetchUsers}
          />
        )}

        {activeTab === 'telegram' && (
          <TelegramPanel
            config={telegramConfig}
            logs={telegramLogs}
            onSaveConfig={handleSaveTelegramConfig}
            onTestPing={handleTestTelegramPing}
          />
        )}

        {activeTab === 'php' && <PhpCodeCenter />}

        {activeTab === 'profile' && (
          <ProfileModal
            currentUser={currentUser}
            users={users}
            onSwitchUser={(user) => {
              setCurrentUser(user);
              localStorage.setItem('center077_user', JSON.stringify(user));
            }}
            onUpdateUser={handleUpdateUser}
            onAddUser={handleAddUser}
            onClose={() => setActiveTab('calendar')}
          />
        )}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        users={users}
        defaultDate={taskModalDefaultDate}
        customCategories={customCategories}
        onAddCustomCategory={handleAddCustomCategory}
      />

      <WorkReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        task={selectedTaskForReport}
        currentUser={currentUser}
        onSubmitReport={handleCompleteTaskWithReport}
      />

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={selectedTaskForDetail}
        currentUser={currentUser}
        onOpenWorkReportModal={(task) => {
          setSelectedTaskForReport(task);
          setIsReportModalOpen(true);
        }}
        onDeleteTask={handleDeleteTask}
        onToggleCheckitem={handleToggleCheckitem}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
