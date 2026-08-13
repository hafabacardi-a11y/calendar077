import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  User,
  Task,
  WorkReport,
  TelegramConfig,
  TelegramLog,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  RecurringPattern,
  ChecklistItem
} from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// --- SECURE PASSWORD HASHING USING NODE NATIVE CRYPTO (PBKDF2 + SALT) ---
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

// --- SEED DATABASE IN MEMORY ---
const initialPasswordHash = hashPassword("admin123");
const contractorPasswordHash = hashPassword("contractor123");

let users: User[] = [
  {
    id: "usr_admin",
    username: "admin",
    email: "admin@center077.gov.ua",
    fullName: "Олександр Коваленко (Головний Інженер)",
    role: "ADMIN",
    company: "КУ \"Центр-\"077\"",
    phone: "+380 (48) 700-00-77",
    telegramUsername: "@admin_center077",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_contractor_cctv",
    username: "contractor_cctv",
    email: "cctv@specmontazh.ua",
    fullName: "Олексій Петров (ТОВ \"СпецСвязьМонтаж\")",
    role: "CONTRACTOR",
    company: "ТОВ \"СпецСвязьМонтаж\"",
    phone: "+380 (50) 222-33-44",
    telegramUsername: "@cctv_master",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_contractor_server",
    username: "contractor_server",
    email: "server@infotech.ua",
    fullName: "Дмитро Смирнов (ТОВ \"ІнфоТех Сервіс\")",
    role: "CONTRACTOR",
    company: "ТОВ \"ІнфоТех Сервіс\"",
    phone: "+380 (67) 333-44-55",
    telegramUsername: "@server_engineer",
    createdAt: new Date().toISOString(),
  },
];

// Map of userId -> passwordHash
const userPasswords: Record<string, string> = {
  usr_admin: initialPasswordHash,
  usr_contractor_cctv: contractorPasswordHash,
  usr_contractor_server: contractorPasswordHash,
};

let contractorCompanies = [
  { id: "comp_1", name: "ТОВ \"СпецСвязьМонтаж\"", contactPerson: "Олексій Петров", phone: "+380 (50) 222-33-44", email: "cctv@specmontazh.ua", slaPercent: 98.5 },
  { id: "comp_2", name: "ТОВ \"ІнфоТех Сервіс\"", contactPerson: "Дмитро Смирнов", phone: "+380 (67) 333-44-55", email: "server@infotech.ua", slaPercent: 99.0 },
  { id: "comp_3", name: "ТОВ \"Мережеві Системи\"", contactPerson: "Андрій Ковальов", phone: "+380 (48) 711-22-33", email: "info@netsys.ua", slaPercent: 95.0 },
];

let customCategoriesList = [
  { id: "cat_cctv", name: "📹 Відеоспостереження", isSystem: true },
  { id: "cat_server", name: "🖥 Серверна кімната", isSystem: true },
  { id: "cat_skud", name: "🔑 СКУД та Замки", isSystem: true },
  { id: "cat_net", name: "🌐 Мережа / СКС", isSystem: true },
  { id: "cat_climate", name: "❄️ Клімат та ДБЖ", isSystem: false },
];

let customStatusesList = [
  { id: "NEW", name: "Нова заявка", color: "purple", isSystem: true },
  { id: "SCHEDULED", name: "Заплановано", color: "blue", isSystem: true },
  { id: "IN_PROGRESS", name: "У роботі", color: "amber", isSystem: true },
  { id: "PENDING_REVIEW", name: "На перевірці", color: "sky", isSystem: true },
  { id: "COMPLETED", name: "Виконано", color: "emerald", isSystem: true },
  { id: "OVERDUE", name: "Прострочено", color: "rose", isSystem: true },
];

let telegramConfig: TelegramConfig = {
  botToken: "",
  chatId: "",
  channelName: "@Center_077_Bot",
  enabled: true,
  notifyNewTask: true,
  notifyUpcomingTask: true,
  notifyCloseReport: true,
};

let telegramLogs: TelegramLog[] = [
  {
    id: "log_init_1",
    timestamp: new Date().toISOString(),
    type: "TEST_PING",
    recipient: "Адміністратори КУ \"Центр-\"077\"",
    messageSnippet: "Система Telegram-повідомлень КУ \"Центр-\"077\" ініціалізована.",
    status: "SIMULATED",
  },
];

const todayStr = new Date().toISOString().split("T")[0];
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split("T")[0];

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const nextWeekStr = nextWeek.toISOString().split("T")[0];

let tasks: Task[] = [
  {
    id: "task_101",
    title: "Регламентне обслуговування ДБЖ та мікроклімату в Головній Серверній №1",
    description: "Провести очищення кондиціонерів від пилу, заміряти залишкову ємність АКБ ДБЖ Eaton 9PX, перевірити заземлення та логи АВР.",
    category: "SERVER_ROOM",
    priority: "HIGH",
    status: "SCHEDULED",
    location: "Серверна №1, Корпус А, 3 поверх (КУ \"Центр-\"077\")",
    assignedContractorId: "usr_contractor_server",
    assignedContractorName: "ТОВ \"ІнфоТех Сервіс\" (Дмитро Смирнов)",
    dueDate: todayStr,
    dueTime: "15:00",
    recurring: "MONTHLY",
    checklist: [
      { id: "c1", label: "Перевірити температуру та вологість (норма 18-22°C)", completed: true },
      { id: "c2", label: "Заміряти напругу на акумуляторах ДБЖ під навантаженням", completed: false },
      { id: "c3", label: "Очистити повітрозабірники зовнішніх блоків кондиціонерів", completed: false },
      { id: "c4", label: "Зняти логи помилок із серверних стійок APC", completed: false },
    ],
    createdById: "usr_admin",
    createdByName: "Олександр Коваленко",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    telegramNotifiedNew: true,
  },
  {
    id: "task_102",
    title: "Профілактика камер відеоспостереження периметра та юстування фокусу",
    description: "Промивка захисного скла 12 поворотних камер Hikvision на південному та східному периметрі, перевірка герметичності коробів, тестування ІЧ-підсвічування.",
    category: "CCTV",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    location: "Периметр, Зона Південь та Схід (Камери №01-12)",
    assignedContractorId: "usr_contractor_cctv",
    assignedContractorName: "ТОВ \"СпецСвязьМонтаж\" (Олексій Петров)",
    dueDate: tomorrowStr,
    dueTime: "12:00",
    recurring: "BIWEEKLY",
    checklist: [
      { id: "c1", label: "Промити купольне скло спецрозчином", completed: true },
      { id: "c2", label: "Перевірити затяжне кріплення кронштейнів", completed: true },
      { id: "c3", label: "Юстування нічного фокусу та автозуму", completed: false },
      { id: "c4", label: "Перевірити глибину архіву NVR за останні 30 днів", completed: false },
    ],
    createdById: "usr_admin",
    createdByName: "Олександр Коваленко",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    telegramNotifiedNew: true,
  },
  {
    id: "task_103",
    title: "Аварійна діагностика відеосервера NVR-04 (Збій жорсткого диска RAID5)",
    description: "У системі контролю зафіксовано помилку SMART на диску №3 в масиві RAID5 відеосервера NVR-04. Необхідна термінова заміна на диск WD Purple 8TB та ребілд.",
    category: "CCTV",
    priority: "URGENT",
    status: "NEW",
    location: "Кросова №2, Будівля Б",
    assignedContractorId: "usr_contractor_cctv",
    assignedContractorName: "ТОВ \"СпецСвязьМонтаж\" (Олексій Петров)",
    dueDate: todayStr,
    dueTime: "18:00",
    recurring: "NONE",
    checklist: [
      { id: "c1", label: "Демонтувати несправний диск №3 із санчат", completed: false },
      { id: "c2", label: "Встановити новий HDD WD Purple 8TB", completed: false },
      { id: "c3", label: "Запустити масив на відновлення (Rebuild RAID)", completed: false },
      { id: "c4", label: "Переконатися у відсутності втрат відеозаписів", completed: false },
    ],
    createdById: "usr_admin",
    createdByName: "Олександр Коваленко",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    telegramNotifiedNew: true,
  },
  {
    id: "task_100",
    title: "Щомісячний аудит системи СКУД та серверних замків",
    description: "Перевірка безперебійного живлення магнітних замків, зчитувачів карток та доводчиків дверей у серверних кімнатах.",
    category: "ACCESS_CONTROL",
    priority: "MEDIUM",
    status: "COMPLETED",
    location: "Серверні кімн. №1 та №2 (КУ \"Центр-\"077\")",
    assignedContractorId: "usr_contractor_server",
    assignedContractorName: "ТОВ \"ІнфоТех Сервіс\" (Дмитро Смирнов)",
    dueDate: "2026-08-05",
    dueTime: "17:00",
    recurring: "MONTHLY",
    checklist: [
      { id: "c1", label: "Перевірка акумуляторів ББЖ-12V", completed: true },
      { id: "c2", label: "Тест аварійного розблокування при пожежі (Fire Alarm)", completed: true },
    ],
    workReport: {
      taskId: "task_100",
      completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      completedBy: "Дмитро Смирнов",
      contractorCompany: "ТОВ \"ІнфоТех Сервіс\"",
      summary: "Проведено плановий огляд замків та зчитувачів СКУД. Замінено акумулятор ББЖ-30 у серверній №2. Проведено симуляцію спрацювання пожежної сигналізації - усі двері розблокувалися штатно.",
      equipmentChecked: ["Магнітні замки YLI", "Зчитувачі IronLogic Matrix-II", "Блок живлення ББЖ-30"],
      partsReplaced: "Акумуляторна батарея Delta HRL 12-12 (1 шт.)",
      timeSpentHours: 2.5,
      statusRating: "EXCELLENT",
      notes: "Замки справні. Зауважень до системи СКУД немає.",
    },
    createdById: "usr_admin",
    createdByName: "Олександр Коваленко",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    telegramNotifiedNew: true,
    telegramNotifiedClose: true,
  },
];

// --- TELEGRAM NOTIFICATION DISPATCHER ---
async function dispatchTelegramMessage(messageText: string, type: TelegramLog['type']) {
  const timestamp = new Date().toISOString();
  
  if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) {
    telegramLogs.unshift({
      id: "log_" + Date.now(),
      timestamp,
      type,
      recipient: telegramConfig.chatId || "Телеграм Канал",
      messageSnippet: messageText.substring(0, 100) + "...",
      status: "SIMULATED",
    });
    return { success: true, simulated: true };
  }

  try {
    const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text: messageText,
        parse_mode: "HTML",
      }),
    });

    const data: any = await response.json();
    if (data.ok) {
      telegramLogs.unshift({
        id: "log_" + Date.now(),
        timestamp,
        type,
        recipient: telegramConfig.chatId,
        messageSnippet: messageText.substring(0, 120) + "...",
        status: "SUCCESS",
      });
      return { success: true, simulated: false, telegramId: data.result?.message_id };
    } else {
      telegramLogs.unshift({
        id: "log_" + Date.now(),
        timestamp,
        type: "ERROR",
        recipient: telegramConfig.chatId,
        messageSnippet: `Ошибка Telegram API: ${data.description || "Unspecified"}`,
        status: "FAILED",
      });
      return { success: false, error: data.description };
    }
  } catch (err: any) {
    telegramLogs.unshift({
      id: "log_" + Date.now(),
      timestamp,
      type: "ERROR",
      recipient: telegramConfig.chatId,
      messageSnippet: `Ошибка отправки: ${err.message}`,
      status: "FAILED",
    });
    return { success: false, error: err.message };
  }
}

// Format message for New Task
function formatNewTaskMessage(task: Task): string {
  const catNames: Record<string, string> = {
    CCTV: "📹 Відеоспостереження",
    SERVER_ROOM: "🖥 Серверна кімната",
    ACCESS_CONTROL: "🔑 СКУД",
    NETWORK: "🌐 Мережа / СКС"
  };
  return `<b>🆕 НОВА ЗАДАЧА В КАЛЕНДАРІ</b>\n\n` +
    `📌 <b>Заявка №${task.id}:</b> ${task.title}\n` +
    `🏷 <b>Категорія:</b> ${catNames[task.category] || task.category}\n` +
    `📍 <b>Об'єкт:</b> ${task.location}\n` +
    `👷‍♂️ <b>Підрядник:</b> ${task.assignedContractorName}\n` +
    `⏰ <b>Термін виконання:</b> ${task.dueDate} ${task.dueTime || ''}\n` +
    `🚨 <b>Пріоритет:</b> ${task.priority}\n\n` +
    `📝 <b>Опис:</b> ${task.description}\n` +
    `🔄 <b>Періодичність:</b> ${task.recurring !== 'NONE' ? task.recurring : 'Разова'}`;
}

// Format message for Detailed Work Report on Close
function formatWorkReportMessage(task: Task, report: WorkReport): string {
  return `<b>✅ ДЕТАЛЬНИЙ ЗВІТ ПО ЗАКРИТІЙ ЗАЯВЦІ</b>\n\n` +
    `📌 <b>Заявка №${task.id}:</b> ${task.title}\n` +
    `📍 <b>Об'єкт:</b> ${task.location}\n` +
    `👷 <b>Виконавець:</b> ${report.contractorCompany} (${report.completedBy})\n` +
    `⏱ <b>Витрачено часу:</b> ${report.timeSpentHours} год.\n` +
    `⭐ <b>Оцінка стану:</b> ${report.statusRating === 'EXCELLENT' ? '🟢 Відмінно' : report.statusRating === 'GOOD' ? '🟡 В нормі' : '🔴 Потребує уваги'}\n\n` +
    `📋 <b>ОПИС ВИКОНАНОЇ РОБОТИ:</b>\n${report.summary}\n\n` +
    (report.partsReplaced ? `🛠 <b>Замінене обладнання/деталі:</b> ${report.partsReplaced}\n\n` : '') +
    `📆 <b>Дата закриття:</b> ${new Date(report.completedAt).toLocaleString('uk-UA')}`;
}

// --- API ROUTES ---

// Auth Routes
app.post("/api/auth/login", (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: "Введіть логін/email та пароль" });
  }

  const user = users.find(u => u.username === login || u.email === login);
  if (!user) {
    return res.status(401).json({ error: "Невірно вказано логін або пароль" });
  }

  const storedHash = userPasswords[user.id];
  if (!verifyPassword(password, storedHash)) {
    return res.status(401).json({ error: "Невірно вказано логін або пароль" });
  }

  res.json({ success: true, user });
});

app.post("/api/auth/register", (req, res) => {
  const { username, email, password, fullName, role, company, phone, telegramUsername } = req.body;

  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: "Усі обов'язкові поля повинні бути заповнені" });
  }

  if (users.some(u => u.username === username || u.email === email)) {
    return res.status(409).json({ error: "Користувач із таким логіном або email вже зареєстрований" });
  }

  const newUser: User = {
    id: "usr_" + Date.now(),
    username,
    email,
    fullName,
    role: role || "CONTRACTOR",
    company: company || "Підрядна організація",
    phone: phone || "",
    telegramUsername: telegramUsername || "",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  userPasswords[newUser.id] = hashPassword(password);

  res.json({ success: true, user: newUser });
});

app.get("/api/users", (req, res) => {
  res.json({ users });
});

app.post("/api/users", (req, res) => {
  const { username, email, password, fullName, role, company, phone, telegramUsername } = req.body;
  if (!fullName || !role) {
    return res.status(400).json({ error: "Вкажіть ПІБ та роль користувача" });
  }

  const generatedUsername = username || ("usr_" + Date.now().toString().slice(-6));
  const generatedEmail = email || `${generatedUsername}@center077.gov.ua`;

  const newUser: User = {
    id: "usr_" + Date.now(),
    username: generatedUsername,
    email: generatedEmail,
    fullName,
    role: role || "CONTRACTOR",
    company: company || "Підрядна організація",
    phone: phone || "",
    telegramUsername: telegramUsername || "",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  userPasswords[newUser.id] = hashPassword(password || "123456");

  res.json({ success: true, user: newUser });
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { fullName, email, company, phone, role, password, telegramUsername, username } = req.body;

  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Користувача не знайдено" });
  }

  users[index] = {
    ...users[index],
    username: username || users[index].username,
    fullName: fullName || users[index].fullName,
    email: email || users[index].email,
    company: company || users[index].company,
    phone: phone !== undefined ? phone : users[index].phone,
    role: role || users[index].role,
    telegramUsername: telegramUsername !== undefined ? telegramUsername : users[index].telegramUsername,
  };

  if (password && password.trim().length > 0) {
    userPasswords[id] = hashPassword(password);
  }

  res.json({ success: true, user: users[index] });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  if (id === "usr_admin") {
    return res.status(400).json({ error: "Головного адміністратора неможливо видалити" });
  }
  users = users.filter(u => u.id !== id);
  delete userPasswords[id];
  res.json({ success: true });
});

// --- CONTRACTOR COMPANIES ROUTES ---
app.get("/api/companies", (req, res) => {
  res.json({ companies: contractorCompanies });
});

app.post("/api/companies", (req, res) => {
  const { name, contactPerson, phone, email, slaPercent } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Вкажіть назву організації" });
  }

  const newCompany = {
    id: "comp_" + Date.now(),
    name,
    contactPerson: contactPerson || "",
    phone: phone || "",
    email: email || "",
    slaPercent: slaPercent ? Number(slaPercent) : 98.0,
  };

  contractorCompanies.push(newCompany);
  res.json({ success: true, company: newCompany });
});

app.put("/api/companies/:id", (req, res) => {
  const { id } = req.params;
  const index = contractorCompanies.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Організацію не знайдено" });
  }

  contractorCompanies[index] = {
    ...contractorCompanies[index],
    ...req.body,
  };

  res.json({ success: true, company: contractorCompanies[index] });
});

app.delete("/api/companies/:id", (req, res) => {
  const { id } = req.params;
  contractorCompanies = contractorCompanies.filter(c => c.id !== id);
  res.json({ success: true });
});

// --- CATEGORIES / FILTERS ROUTES ---
app.get("/api/categories", (req, res) => {
  res.json({ categories: customCategoriesList });
});

app.post("/api/categories", (req, res) => {
  const { name, icon } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Вкажіть назву фільтру/категорії" });
  }

  const newCat = {
    id: "cat_" + Date.now(),
    name,
    icon: icon || "🏷️",
    isSystem: false,
  };

  customCategoriesList.push(newCat);
  res.json({ success: true, category: newCat });
});

app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const index = customCategoriesList.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Категорію не знайдено" });
  }

  customCategoriesList[index] = {
    ...customCategoriesList[index],
    ...req.body,
  };

  res.json({ success: true, category: customCategoriesList[index] });
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const cat = customCategoriesList.find(c => c.id === id);
  if (cat?.isSystem) {
    return res.status(400).json({ error: "Системну категорію не можна видалити" });
  }
  customCategoriesList = customCategoriesList.filter(c => c.id !== id);
  res.json({ success: true });
});

// --- STATUSES ROUTES ---
app.get("/api/statuses", (req, res) => {
  res.json({ statuses: customStatusesList });
});

app.post("/api/statuses", (req, res) => {
  const { name, color } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Вкажіть назву статусу" });
  }

  const newStatus = {
    id: "STAT_" + Date.now(),
    name,
    color: color || "indigo",
    isSystem: false,
  };

  customStatusesList.push(newStatus);
  res.json({ success: true, status: newStatus });
});

app.put("/api/statuses/:id", (req, res) => {
  const { id } = req.params;
  const index = customStatusesList.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Статус не знайдено" });
  }

  customStatusesList[index] = {
    ...customStatusesList[index],
    ...req.body,
  };

  res.json({ success: true, status: customStatusesList[index] });
});

app.delete("/api/statuses/:id", (req, res) => {
  const { id } = req.params;
  const st = customStatusesList.find(s => s.id === id);
  if (st?.isSystem) {
    return res.status(400).json({ error: "Системний статус видалити неможливо" });
  }
  customStatusesList = customStatusesList.filter(s => s.id !== id);
  res.json({ success: true });
});

// Tasks Routes
app.get("/api/tasks", (req, res) => {
  res.json({ tasks });
});

app.post("/api/tasks", async (req, res) => {
  const { title, description, category, priority, location, assignedContractorId, dueDate, dueTime, recurring, checklist, createdById, createdByName } = req.body;

  if (!title || !category || !dueDate || !assignedContractorId) {
    return res.status(400).json({ error: "Укажите название, категорию, дату и исполнителя" });
  }

  const contractor = users.find(u => u.id === assignedContractorId);
  const contractorName = contractor ? `${contractor.company} (${contractor.fullName})` : "Не назначено";

  const newTask: Task = {
    id: "task_" + Math.floor(100 + Math.random() * 900),
    title,
    description: description || "",
    category: category as TaskCategory,
    priority: (priority || "MEDIUM") as TaskPriority,
    status: "SCHEDULED",
    location: location || "Серверная / Объект видеонаблюдения",
    assignedContractorId,
    assignedContractorName: contractorName,
    dueDate,
    dueTime: dueTime || "18:00",
    recurring: (recurring || "NONE") as RecurringPattern,
    checklist: Array.isArray(checklist) ? checklist : [],
    createdById: createdById || "usr_admin",
    createdByName: createdByName || "Администратор",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    telegramNotifiedNew: false,
  };

  tasks.unshift(newTask);

  // Trigger Telegram notification
  if (telegramConfig.notifyNewTask) {
    const msg = formatNewTaskMessage(newTask);
    await dispatchTelegramMessage(msg, "NEW_TASK");
    newTask.telegramNotifiedNew = true;
  }

  res.json({ success: true, task: newTask });
});

app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Задача не найдена" });
  }

  tasks[index] = {
    ...tasks[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, task: tasks[index] });
});

// Complete Task with Detailed Work Report
app.post("/api/tasks/:id/complete", async (req, res) => {
  const { id } = req.params;
  const { summary, equipmentChecked, partsReplaced, timeSpentHours, statusRating, notes, completedBy, contractorCompany } = req.body;

  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Задача не найдена" });
  }

  if (!summary || summary.trim().length < 5) {
    return res.status(400).json({ error: "Необходимо заполнить подробный отчет о выполненной работе" });
  }

  const workReport: WorkReport = {
    taskId: id,
    completedAt: new Date().toISOString(),
    completedBy: completedBy || "Инженер подрядчика",
    contractorCompany: contractorCompany || tasks[index].assignedContractorName,
    summary,
    equipmentChecked: Array.isArray(equipmentChecked) ? equipmentChecked : ["Оборудование объекта"],
    partsReplaced: partsReplaced || "",
    timeSpentHours: Number(timeSpentHours) || 1,
    statusRating: statusRating || "EXCELLENT",
    notes: notes || "",
  };

  // Mark all checklist items completed
  const updatedChecklist = tasks[index].checklist.map(item => ({ ...item, completed: true }));

  tasks[index] = {
    ...tasks[index],
    status: "COMPLETED",
    checklist: updatedChecklist,
    workReport,
    updatedAt: new Date().toISOString(),
    telegramNotifiedClose: false,
  };

  // Send Telegram Notification
  if (telegramConfig.notifyCloseReport) {
    const msg = formatWorkReportMessage(tasks[index], workReport);
    await dispatchTelegramMessage(msg, "WORK_REPORT");
    tasks[index].telegramNotifiedClose = true;
  }

  res.json({ success: true, task: tasks[index], workReport });
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  res.json({ success: true });
});

// Telegram Config & Test Routes
app.get("/api/telegram/config", (req, res) => {
  res.json({ config: telegramConfig, logs: telegramLogs });
});

app.post("/api/telegram/config", (req, res) => {
  telegramConfig = { ...telegramConfig, ...req.body };
  res.json({ success: true, config: telegramConfig });
});

app.post("/api/telegram/test-ping", async (req, res) => {
  const message = `🔔 <b>ТЕСТОВАЯ ПРОВЕРКА TELEGRAM-БОТА</b>\n\n` +
    `Система обслуживания Видеонаблюдения и Серверной работает в штатном режиме.\n` +
    `⏰ Время проверки: ${new Date().toLocaleString('ru-RU')}\n` +
    `✅ Бот готов к рассылке уведомлений о новых заявках и отчетах.`;

  const result = await dispatchTelegramMessage(message, "TEST_PING");
  res.json(result);
});

// AI Report Enhancer via Gemini API
app.post("/api/ai/enhance-report", async (req, res) => {
  const { rawNotes, category, location } = req.body;
  if (!rawNotes) {
    return res.status(400).json({ error: "Укажите черновые заметки отчета" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY не установлен в окружении" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Преобразуй следующие черновые заметки инженера-подрядчика по обслуживанию систем (${category}, объект: ${location}) в профессиональный, четкий и грамотный инженерный отчет о проделанной работе.
Ответь ТОЛЬКО структурированным текстом отчета на русском языке.

Заметки:
"${rawNotes}"`,
    });

    res.json({ enhancedText: response.text });
  } catch (err: any) {
    res.status(500).json({ error: "Ошибка ИИ генерации: " + err.message });
  }
});

// Start Server and Mount Vite / Production Fallback
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
