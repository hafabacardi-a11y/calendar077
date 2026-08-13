import React, { useState, useEffect } from 'react';
import { Task, User, TaskStatus, CustomStatus, ContractorCompany, CategoryItem } from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  Building2,
  Video,
  Server,
  Key,
  Network,
  Plus,
  Eye,
  FileCheck2,
  TrendingUp,
  Award,
  Tag,
  Trash2,
  Edit2,
  Users,
  Sliders,
  Settings2,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  tasks: Task[];
  users: User[];
  onOpenCreateTaskModal?: () => void;
  onSelectTask: (task: Task) => void;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  customCategories?: string[];
  onRefreshData?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tasks,
  users: initialUsers,
  onOpenCreateTaskModal,
  onSelectTask,
  onQuickStatusChange,
  customCategories = [],
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'TASKS' | 'USERS' | 'COMPANIES' | 'CATEGORIES' | 'STATUSES'>('TASKS');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Local state for CRUD operations
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [companiesList, setCompaniesList] = useState<ContractorCompany[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [statusesList, setStatusesList] = useState<CustomStatus[]>([]);

  // Modals for CRUD
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    company: '',
    role: 'CONTRACTOR' as any,
    password: '',
  });

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ContractorCompany | null>(null);
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    slaPercent: 98.0,
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    icon: '🏷️',
  });

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<CustomStatus | null>(null);
  const [statusFormData, setStatusFormData] = useState({
    name: '',
    color: 'indigo' as any,
  });

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'USER' | 'COMPANY' | 'CATEGORY' | 'STATUS';
    id: string;
    name: string;
  } | null>(null);

  // Sync initial users when prop updates
  useEffect(() => {
    setUsersList(initialUsers);
  }, [initialUsers]);

  // Load Companies, Categories, Statuses from server
  useEffect(() => {
    fetchCompanies();
    fetchCategories();
    fetchStatuses();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (data.companies) setCompaniesList(data.companies);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) setCategoriesList(data.categories);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await fetch('/api/statuses');
      const data = await res.json();
      if (data.statuses) setStatusesList(data.statuses);
    } catch (e) {
      console.error(e);
    }
  };

  // --- USER CRUD HANDLERS ---
  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        company: user.company,
        role: user.role,
        password: '',
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        company: 'ТОВ "СпецМонтаж"',
        role: 'CONTRACTOR',
        password: '',
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.fullName) return;

    try {
      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userFormData),
        });
        const data = await res.json();
        if (data.success) {
          setUsersList(prev => prev.map(u => u.id === editingUser.id ? data.user : u));
          setFeedbackMsg('Користувача оновлено успішно!');
        } else {
          setFeedbackMsg(data.error || 'Помилка оновлення користувача');
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userFormData),
        });
        const data = await res.json();
        if (data.success) {
          setUsersList(prev => [...prev, data.user]);
          setFeedbackMsg('Нового користувача створено успішно!');
        } else {
          setFeedbackMsg(data.error || 'Помилка створення користувача');
        }
      }
      setIsUserModalOpen(false);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedbackMsg('Помилка збереження користувача: ' + err.message);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === 'usr_admin') {
      setFeedbackMsg('Неможливо видалити головного адміністратора!');
      return;
    }
    setItemToDelete({ type: 'USER', id: userId, name: userName });
  };

  // --- COMPANY CRUD HANDLERS ---
  const handleOpenCompanyModal = (comp?: ContractorCompany) => {
    if (comp) {
      setEditingCompany(comp);
      setCompanyFormData({
        name: comp.name,
        contactPerson: comp.contactPerson,
        phone: comp.phone,
        email: comp.email,
        slaPercent: comp.slaPercent || 98.0,
      });
    } else {
      setEditingCompany(null);
      setCompanyFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        slaPercent: 98.0,
      });
    }
    setIsCompanyModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyFormData.name) return;

    try {
      if (editingCompany) {
        const res = await fetch(`/api/companies/${editingCompany.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyFormData),
        });
        const data = await res.json();
        if (data.success) {
          setCompaniesList(prev => prev.map(c => c.id === editingCompany.id ? data.company : c));
          setFeedbackMsg('Організацію оновлено!');
        } else {
          setFeedbackMsg(data.error || 'Помилка оновлення організації');
        }
      } else {
        const res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyFormData),
        });
        const data = await res.json();
        if (data.success) {
          setCompaniesList(prev => [...prev, data.company]);
          setFeedbackMsg('Нову підрядну організацію додано!');
        } else {
          setFeedbackMsg(data.error || 'Помилка додавання організації');
        }
      }
      setIsCompanyModalOpen(false);
    } catch (err: any) {
      setFeedbackMsg('Помилка збереження організації: ' + err.message);
    }
  };

  const handleDeleteCompany = (compId: string, compName: string) => {
    setItemToDelete({ type: 'COMPANY', id: compId, name: compName });
  };

  // --- CATEGORIES CRUD HANDLERS ---
  const handleOpenCategoryModal = (cat?: CategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryFormData({ name: cat.name, icon: cat.icon || '🏷️' });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: '', icon: '🏷️' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name) return;

    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryFormData),
        });
        const data = await res.json();
        if (data.success) {
          setCategoriesList(prev => prev.map(c => c.id === editingCategory.id ? data.category : c));
          setFeedbackMsg('Категорію/Фільтр оновлено!');
        } else {
          setFeedbackMsg(data.error || 'Помилка оновлення фільтру');
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryFormData),
        });
        const data = await res.json();
        if (data.success) {
          setCategoriesList(prev => [...prev, data.category]);
          setFeedbackMsg('Новий фільтр створено!');
        } else {
          setFeedbackMsg(data.error || 'Помилка створення фільтру');
        }
      }
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      setFeedbackMsg('Помилка збереження категорій: ' + err.message);
    }
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    setItemToDelete({ type: 'CATEGORY', id: catId, name: catName });
  };

  // --- STATUSES CRUD HANDLERS ---
  const handleOpenStatusModal = (st?: CustomStatus) => {
    if (st) {
      setEditingStatus(st);
      setStatusFormData({ name: st.name, color: st.color });
    } else {
      setEditingStatus(null);
      setStatusFormData({ name: '', color: 'indigo' });
    }
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusFormData.name) return;

    try {
      if (editingStatus) {
        const res = await fetch(`/api/statuses/${editingStatus.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statusFormData),
        });
        const data = await res.json();
        if (data.success) {
          setStatusesList(prev => prev.map(s => s.id === editingStatus.id ? data.status : s));
          setFeedbackMsg('Статус оновлено!');
        } else {
          setFeedbackMsg(data.error || 'Помилка оновлення статусу');
        }
      } else {
        const res = await fetch('/api/statuses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statusFormData),
        });
        const data = await res.json();
        if (data.success) {
          setStatusesList(prev => [...prev, data.status]);
          setFeedbackMsg('Новий статус створено!');
        } else {
          setFeedbackMsg(data.error || 'Помилка створення статусу');
        }
      }
      setIsStatusModalOpen(false);
    } catch (err: any) {
      setFeedbackMsg('Помилка: ' + err.message);
    }
  };

  const handleDeleteStatus = (stId: string, stName: string) => {
    setItemToDelete({ type: 'STATUS', id: stId, name: stName });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    setItemToDelete(null);

    try {
      if (type === 'USER') {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setUsersList(prev => prev.filter(u => u.id !== id));
          setFeedbackMsg('Користувача видалено.');
          if (onRefreshData) onRefreshData();
        } else {
          setFeedbackMsg(data.error || 'Помилка видалення користувача');
        }
      } else if (type === 'COMPANY') {
        const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setCompaniesList(prev => prev.filter(c => c.id !== id));
          setFeedbackMsg('Підрядну організацію видалено.');
        } else {
          setFeedbackMsg(data.error || 'Помилка видалення організації');
        }
      } else if (type === 'CATEGORY') {
        const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setCategoriesList(prev => prev.filter(c => c.id !== id));
          setFeedbackMsg('Фільтр видалено.');
        } else {
          setFeedbackMsg(data.error || 'Помилка видалення');
        }
      } else if (type === 'STATUS') {
        const res = await fetch(`/api/statuses/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setStatusesList(prev => prev.filter(s => s.id !== id));
          setFeedbackMsg('Статус видалено.');
        } else {
          setFeedbackMsg(data.error || 'Неможливо видалити системний статус');
        }
      }
    } catch (err: any) {
      setFeedbackMsg('Помилка: ' + err.message);
    }
  };

  // Filtering for Tasks
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const overdueTasks = tasks.filter(t => t.status === 'OVERDUE');

  const filteredTasks = tasks.filter(t => {
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.assignedContractorName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Message */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-600 hover:text-emerald-900 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Admin Tab Navigation Header */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'TASKS'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Моніторинг Заявок ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'USERS'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Користувачі ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPANIES')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'COMPANIES'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Підрядні Організації ({companiesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'CATEGORIES'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-4 h-4 text-purple-400" />
            <span>Фільтри та Системи ({categoriesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STATUSES')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'STATUSES'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Статуси Заявок ({statusesList.length})</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: MONITORING & TASKS --- */}
      {activeTab === 'TASKS' && (
        <div className="space-y-6">
          {/* KPI Cards Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Активні Заявки</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{activeTasks.length}</h3>
                <p className="text-xs text-slate-500 mt-1">З {totalTasks} усього в системі</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between ${
              overdueTasks.length > 0
                ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                : 'bg-white border-slate-200'
            }`}>
              <div>
                <p className="text-xs font-bold uppercase opacity-80">Прострочено Термінів</p>
                <h3 className={`text-2xl font-black mt-1 ${overdueTasks.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {overdueTasks.length}
                </h3>
                <p className="text-xs opacity-80 mt-1">Потребують реагування</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                overdueTasks.length > 0
                  ? 'bg-rose-500 text-white border-rose-600 shadow-rose-200 shadow-lg'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Підрядники</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{companiesList.length} <span className="text-xs font-normal text-slate-500">компанії</span></h3>
                <p className="text-xs text-emerald-600 font-bold mt-1">SLA Дотримано</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Системи / Фільтри</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{categoriesList.length}</h3>
                <p className="text-xs text-emerald-600 font-bold mt-1">КУ "Центр-"077"</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Filter className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Моніторинг Заявок Обслуговування</h3>
                <p className="text-xs text-slate-500">Оперативний контроль строків та статусів виконуваних робіт</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Пошук..."
                    className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500 w-40 font-medium"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-bold"
                >
                  <option value="ALL">Усі системи</option>
                  {categoriesList.map(c => (
                    <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-bold"
                >
                  <option value="ALL">Усі статуси</option>
                  {statusesList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">№ / Назва</th>
                    <th className="py-3 px-4">Система</th>
                    <th className="py-3 px-4">Об'єкт</th>
                    <th className="py-3 px-4">Виконавець</th>
                    <th className="py-3 px-4">Термін</th>
                    <th className="py-3 px-4">Пріоритет</th>
                    <th className="py-3 px-4">Статус</th>
                    <th className="py-3 px-4 text-right">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">Заявки відсутні.</td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          <div>{t.id}</div>
                          <div className="font-sans text-slate-900 font-bold line-clamp-1">{t.title}</div>
                        </td>

                        <td className="py-3 px-4 font-bold">{t.category}</td>
                        <td className="py-3 px-4 text-slate-600">{t.location}</td>
                        <td className="py-3 px-4 font-bold">{t.assignedContractorName}</td>
                        <td className="py-3 px-4 font-mono">{t.dueDate} {t.dueTime || ''}</td>
                        <td className="py-3 px-4 font-bold">{t.priority}</td>
                        
                        <td className="py-3 px-4">
                          <select
                            value={t.status}
                            onChange={(e) => onQuickStatusChange(t.id, e.target.value as TaskStatus)}
                            className="text-xs font-bold rounded-lg px-2 py-1 border focus:outline-none bg-slate-50"
                          >
                            {statusesList.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onSelectTask(t)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-bold text-xs transition"
                          >
                            Звіт
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: USERS CRUD --- */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Управління Користувачами</h3>
              <p className="text-xs text-slate-500">Додавання, редагування, зміна паролів та видалення користувачів системи</p>
            </div>
            <button
              onClick={() => handleOpenUserModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Додати Користувача</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">ПІБ</th>
                  <th className="py-3 px-4">Логін</th>
                  <th className="py-3 px-4">Роль</th>
                  <th className="py-3 px-4">Організація</th>
                  <th className="py-3 px-4">Телефон / Email</th>
                  <th className="py-3 px-4 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.fullName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600"><code>{u.username}</code></td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">{u.company}</td>
                    <td className="py-3 px-4 text-slate-600">{u.phone || '-'} / {u.email}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenUserModal(u)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {u.id !== 'usr_admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.fullName)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: CONTRACTOR COMPANIES CRUD --- */}
      {activeTab === 'COMPANIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Підрядні Організації</h3>
              <p className="text-xs text-slate-500">Додавання та редагування підрядних компаній та їх показників SLA</p>
            </div>
            <button
              onClick={() => handleOpenCompanyModal()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Створити Організацію</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companiesList.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">Представник: <b>{c.contactPerson}</b></p>
                  <p className="text-xs text-slate-500">Тел: {c.phone} | Email: {c.email}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    SLA: {c.slaPercent}%
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenCompanyModal(c)}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(c.id, c.name)}
                    className="p-1.5 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: CATEGORIES / FILTERS CRUD --- */}
      {activeTab === 'CATEGORIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Фільтри та Категорії Систем</h3>
              <p className="text-xs text-slate-500">Керування списком систем (Відеоспостереження, СКУД, Клімат тощо)</p>
            </div>
            <button
              onClick={() => handleOpenCategoryModal()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Створити Свій Фільтр</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categoriesList.map((cat) => (
              <div key={cat.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{cat.icon || '🏷️'}</span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{cat.name}</div>
                    {cat.isSystem && <span className="text-[9px] text-slate-400 font-bold uppercase">Системний</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenCategoryModal(cat)}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!cat.isSystem && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 5: TASK STATUSES CRUD --- */}
      {activeTab === 'STATUSES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Управління Статусами Заявок</h3>
              <p className="text-xs text-slate-500">Налаштування pipeline статусів (Заплановано, У роботі, Виконано тощо)</p>
            </div>
            <button
              onClick={() => handleOpenStatusModal()}
              className="bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Створити Новий Статус</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {statusesList.map((st) => (
              <div key={st.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{st.name}</div>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {st.id}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenStatusModal(st)}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!st.isSystem && (
                    <button
                      onClick={() => handleDeleteStatus(st.id, st.name)}
                      className="p-1.5 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL: USER ADD/EDIT --- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="shrink-0 bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">{editingUser ? 'Редагувати Користувача' : 'Створити Користувача'}</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3 text-xs text-slate-800 overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">ПІБ *</label>
                <input
                  type="text"
                  required
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  placeholder="Олексій Коваленко"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Логін</label>
                  <input
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    placeholder="alex_master"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Роль</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                  >
                    <option value="CONTRACTOR">Підрядник</option>
                    <option value="ADMIN">Адміністратор</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Назва Організації</label>
                <input
                  type="text"
                  value={userFormData.company}
                  onChange={(e) => setUserFormData({ ...userFormData, company: e.target.value })}
                  placeholder='ТОВ "СпецМонтаж"'
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="user@center077.gov.ua"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Телефон</label>
                  <input
                    type="text"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    placeholder="+380..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Пароль (залиште порожнім якщо без змін)</label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="******"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: COMPANY ADD/EDIT --- */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="shrink-0 bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">{editingCompany ? 'Редагувати Організацію' : 'Створити Підрядника'}</h3>
              <button onClick={() => setIsCompanyModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="p-5 space-y-3 text-xs text-slate-800 overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Назва Організації *</label>
                <input
                  type="text"
                  required
                  value={companyFormData.name}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                  placeholder='ТОВ "СпецСвязьМонтаж"'
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Контактна Особа</label>
                <input
                  type="text"
                  value={companyFormData.contactPerson}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, contactPerson: e.target.value })}
                  placeholder="Олексій Петров"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Телефон</label>
                  <input
                    type="text"
                    value={companyFormData.phone}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, phone: e.target.value })}
                    placeholder="+380..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={companyFormData.email}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                    placeholder="info@spec.ua"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white font-bold rounded-lg"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CATEGORY ADD/EDIT --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="shrink-0 bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">{editingCategory ? 'Редагувати Фільтр' : 'Створити Фільтр / Систему'}</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-3 text-xs text-slate-800 overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Назва Фільтру / Системи *</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="Наприклад: Акустичні системи"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Емодзі / Іконка</label>
                <input
                  type="text"
                  value={categoryFormData.icon}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                  placeholder="🔊"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white font-bold rounded-lg"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: STATUS ADD/EDIT --- */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="shrink-0 bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">{editingStatus ? 'Редагувати Статус' : 'Створити Новий Статус'}</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="p-5 space-y-3 text-xs text-slate-800 overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Назва Статусу *</label>
                <input
                  type="text"
                  required
                  value={statusFormData.name}
                  onChange={(e) => setStatusFormData({ ...statusFormData, name: e.target.value })}
                  placeholder="Наприклад: Замовлення запчастин"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white font-bold rounded-lg"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL FOR DELETION --- */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Підтвердження видалення</h3>
            <p className="text-xs text-slate-600 mb-6">
              Ви дійсно бажаєте видалити <span className="font-bold text-slate-900">«{itemToDelete.name}»</span>? Цю дію неможливо скасувати.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Так, видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
