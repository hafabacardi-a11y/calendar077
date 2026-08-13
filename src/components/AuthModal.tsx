import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, Lock, Mail, User as UserIcon, Building2, AlertCircle, CheckSquare, Square } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, remember: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form State
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regCompany, setRegCompany] = useState('ТОВ "СпецМонтаж"');
  const [regRole, setRegRole] = useState<UserRole>('CONTRACTOR');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved login if available
    const savedLogin = localStorage.getItem('center077_saved_login');
    if (savedLogin) {
      setLogin(savedLogin);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) {
      setErrorMsg('Введіть логін та пароль.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        if (rememberMe) {
          localStorage.setItem('center077_saved_login', login);
        } else {
          localStorage.removeItem('center077_saved_login');
        }
        onLoginSuccess(data.user, rememberMe);
        onClose();
      } else {
        setErrorMsg(data.error || 'Помилка входу');
      }
    } catch (err: any) {
      setErrorMsg('Помилка з\'єднання: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword || !regFullName) {
      setErrorMsg('Заповніть усі обов’язкові поля.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          fullName: regFullName,
          role: regRole,
          company: regCompany,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user, rememberMe);
        onClose();
      } else {
        setErrorMsg(data.error || 'Помилка реєстрації');
      }
    } catch (err: any) {
      setErrorMsg('Помилка з\'єднання: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Fixed Top */}
        <div className="shrink-0 bg-slate-900 text-white p-5 text-center relative">
          <div className="w-11 h-11 rounded-xl bg-blue-600 mx-auto flex items-center justify-center font-bold mb-1.5 shadow-lg shadow-blue-500/30">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-base">Авторизація в Системі</h3>
          <p className="text-xs text-blue-300 font-semibold">КУ "Центр-"077"</p>
        </div>

        {/* Tab Switch */}
        <div className="shrink-0 flex border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('LOGIN'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition ${
              mode === 'LOGIN' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500'
            }`}
          >
            Вхід у систему
          </button>
          <button
            type="button"
            onClick={() => { setMode('REGISTER'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition ${
              mode === 'REGISTER' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500'
            }`}
          >
            Реєстрація Підрядника
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-5 text-xs text-slate-800 overflow-y-auto flex-1 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center space-x-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Логін / Email</label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="admin або contractor_cctv"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123 або contractor123"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Remember Me Checkbox */}
              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer font-medium pt-1">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Запам'ятати мене (Зберігати сесію після оновлення)</span>
              </label>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">💡 Тестові облікові дані:</p>
                <div>• <b>Адміністратор:</b> <code>admin</code> / <code>admin123</code></div>
                <div>• <b>Підрядник:</b> <code>contractor_cctv</code> / <code>contractor123</code></div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition"
              >
                {loading ? 'Вхід...' : 'Увійти'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Логін *</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="cctv_master"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email *</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="master@spec.ua"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">ПІБ Представника *</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Іван Іванов"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Назва Підрядної Організації</label>
                <input
                  type="text"
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder='ТОВ "СпецМонтаж"'
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Пароль *</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="******"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition mt-2"
              >
                {loading ? 'Створення...' : 'Зареєструвати Підрядника'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
