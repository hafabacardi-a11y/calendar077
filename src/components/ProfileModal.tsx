import React, { useState } from 'react';
import { User } from '../types';
import { X, User as UserIcon, Building2, Phone, Mail, Lock, Shield, Plus, Check } from 'lucide-react';

interface ProfileModalProps {
  currentUser: User | null;
  users: User[];
  onSwitchUser: (user: User) => void;
  onUpdateUser: (updatedUser: User) => void;
  onAddUser: (newUser: any) => Promise<void>;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  users,
  onSwitchUser,
  onUpdateUser,
  onAddUser,
  onClose,
}) => {
  if (!currentUser) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'add_contractor'>('profile');

  // Edit My Profile Form State
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [company, setCompany] = useState(currentUser.company);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [password, setPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  // Add Contractor Form State
  const [newFullName, setNewFullName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [addMsg, setAddMsg] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          company,
          phone,
          password: password.trim() ? password : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onUpdateUser(data.user);
        setProfileMsg('Дані вашого профілю успішно оновлено!');
        setPassword('');
      } else {
        setProfileMsg('Помилка оновлення: ' + (data.error || 'Невідома'));
      }
    } catch (err: any) {
      setProfileMsg('Помилка: ' + err.message);
    }
  };

  const handleCreateContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newCompany) {
      setAddMsg('Заповніть ПІБ та назву організації.');
      return;
    }

    try {
      await onAddUser({
        username: newUsername || 'cctv_' + Date.now().toString().slice(-4),
        fullName: newFullName,
        company: newCompany,
        email: newEmail || 'contractor@center077.gov.ua',
        phone: newPhone,
        password: newPassword || 'contractor123',
        role: 'CONTRACTOR',
      });

      setAddMsg('Підрядну організацію успішно створено!');
      setNewFullName('');
      setNewCompany('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setNewUsername('');
    } catch (err: any) {
      setAddMsg('Помилка: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="shrink-0 bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Профіль Користувача & Керування Доступом</h3>
              <p className="text-xs text-blue-300 font-medium">КУ "Центр-"077"</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="shrink-0 flex border-b border-slate-200 text-xs font-bold bg-slate-50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'profile'
                ? 'bg-white text-blue-600 border-blue-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Мій Профіль
          </button>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('add_contractor')}
              className={`flex-1 py-3 text-center transition border-b-2 ${
                activeTab === 'add_contractor'
                  ? 'bg-white text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              + Додати / Управління Підрядниками
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-4 text-xs text-slate-800 overflow-y-auto flex-1">
          
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {profileMsg && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg font-bold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{profileMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">ПІБ Користувача</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Організація / Компанія</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Електронна пошта</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Телефон</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+380 (50) 000-00-00"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Новий пароль (залиште порожнім, якщо не змінюєте)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              {/* Fast Account Switcher */}
              <div className="pt-2">
                <label className="block font-bold text-slate-900 uppercase mb-2">
                  Швидке перемикання між акаунтами (Тестовий режим)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {users.map((u) => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => onSwitchUser(u)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        u.id === currentUser.id
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-900 truncate">{u.fullName}</div>
                      <div className="text-[10px] text-slate-500 truncate">{u.company}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Закрити
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition"
                >
                  Зберегти зміни
                </button>
              </div>
            </form>
          )}

          {activeTab === 'add_contractor' && currentUser.role === 'ADMIN' && (
            <form onSubmit={handleCreateContractor} className="space-y-4">
              
              {addMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-bold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{addMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Назва Підрядної Організації *</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder='ТОВ "СпецМонтаж"'
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">ПІБ Представника / Інженера *</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Іванов Іван Іванович"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Логін для входу</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="contractor_cctv"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Пароль</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="contractor123"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="master@spec.ua"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Телефон</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+380 (50) 111-22-33"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Створити Підрядника</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
