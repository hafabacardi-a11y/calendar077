/**
 * Core Data Models & Enums for Maintenance Calendar System
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'CONTRACTOR';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  company: string;
  phone: string;
  telegramUsername?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CustomStatus {
  id: string;
  name: string;
  color: 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'sky' | 'indigo';
  isSystem?: boolean;
}

export interface ContractorCompany {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  slaPercent?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
  isSystem?: boolean;
}

export type TaskCategory = 'CCTV' | 'SERVER_ROOM' | 'ACCESS_CONTROL' | 'NETWORK' | string;

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus = 'NEW' | 'SCHEDULED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'OVERDUE';

export type RecurringPattern = 'NONE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface WorkReport {
  taskId: string;
  completedAt: string;
  completedBy: string;
  contractorCompany: string;
  summary: string;
  equipmentChecked: string[];
  partsReplaced?: string;
  timeSpentHours: number;
  statusRating: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION';
  notes?: string;
  photoUrls?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  location: string;
  assignedContractorId: string;
  assignedContractorName: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  recurring: RecurringPattern;
  checklist: ChecklistItem[];
  workReport?: WorkReport;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  telegramNotifiedNew?: boolean;
  telegramNotifiedUpcoming?: boolean;
  telegramNotifiedClose?: boolean;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  channelName: string;
  enabled: boolean;
  notifyNewTask: boolean;
  notifyUpcomingTask: boolean;
  notifyCloseReport: boolean;
}

export interface TelegramLog {
  id: string;
  timestamp: string;
  type: 'NEW_TASK' | 'UPCOMING_TASK' | 'WORK_REPORT' | 'TEST_PING' | 'ERROR';
  recipient: string;
  messageSnippet: string;
  status: 'SUCCESS' | 'FAILED' | 'SIMULATED';
}

export interface DashboardStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  cctvActiveTasks: number;
  serverRoomActiveTasks: number;
  contractorSlaPercent: number;
}
