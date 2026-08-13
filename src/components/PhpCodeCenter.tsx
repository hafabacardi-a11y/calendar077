import React, { useState } from 'react';
import {
  PHP_SCHEMA_SQL,
  PHP_CONFIG_PDO,
  PHP_AUTH_HANDLERS,
  PHP_TELEGRAM_BOT
} from '../lib/phpExportCode';
import { FileCode2, Copy, Check, Download, Database, ShieldCheck, KeyRound, Bot, Code } from 'lucide-react';

export const PhpCodeCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'config' | 'auth' | 'telegram'>('sql');
  const [copied, setCopied] = useState(false);

  const getCodeForActiveTab = () => {
    switch (activeTab) {
      case 'sql':
        return PHP_SCHEMA_SQL;
      case 'config':
        return PHP_CONFIG_PDO;
      case 'auth':
        return PHP_AUTH_HANDLERS;
      case 'telegram':
        return PHP_TELEGRAM_BOT;
    }
  };

  const getFilenameForActiveTab = () => {
    switch (activeTab) {
      case 'sql': return 'schema.sql';
      case 'config': return 'config.php';
      case 'auth': return 'auth.php';
      case 'telegram': return 'telegram_bot.php';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeForActiveTab());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([getCodeForActiveTab()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = getFilenameForActiveTab();
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg">
            <FileCode2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Центр PHP & MySQL Исходного Кода</h2>
            <p className="text-xs text-slate-400">
              Готовые PHP скрипты с PDO подготовленными запросами (Prepared Statements), Хешированием Паролей (BCRYPT) и Валидацией
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCode}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Скопировано!' : 'Скопировать Код'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Скачать {getFilenameForActiveTab()}</span>
          </button>
        </div>
      </div>

      {/* Security Best Practices Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold">
            <Database className="w-4 h-4" />
            <span>PDO Prepared Statements</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Защита от SQL-инъекций. Использование <code>$stmt-&gt;prepare()</code> и параметризованных запросов с отключенной эмуляцией PDO.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold">
            <KeyRound className="w-4 h-4" />
            <span>BCRYPT Password Hashing</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Безопасное хранение паролей с помощью <code>password_hash($pass, PASSWORD_BCRYPT)</code> и верификация через <code>password_verify()</code>.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-sky-600 font-bold">
            <Bot className="w-4 h-4" />
            <span>cURL Telegram Dispatcher</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Функция <code>sendTelegramNotification()</code> для отправки детальных отчетов о закрытых заявках прямо на Telegram API.
          </p>
        </div>
      </div>

      {/* Code Viewer Tabs & Window */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        
        {/* File Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-2 border-b border-slate-800 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'sql'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>schema.sql</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'config'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>config.php (PDO)</span>
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'auth'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>auth.php (Password Hash & PDO)</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'telegram'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>telegram_bot.php</span>
          </button>
        </div>

        {/* Code Output Window */}
        <div className="p-4 overflow-x-auto">
          <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre font-normal select-all">
            {getCodeForActiveTab()}
          </pre>
        </div>
      </div>
    </div>
  );
};
