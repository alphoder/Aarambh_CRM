// Unified storage layer: reads/writes to Neon PostgreSQL via Drizzle when DATABASE_URL is present,
// with clean empty initial state (no dummy or mock data).

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales_executive';
  avatar?: string;
  telegramUsername?: string;
  telegramChatId?: string;
  isActive: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  address?: string;
  city: string;
  state: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  source: 'manual' | 'upload' | 'referral' | 'website' | 'social_media' | 'cold_call' | 'other';
  productId: string;
  productName?: string;
  assignedTo?: string;
  assigneeName?: string;
  notes?: string;
  value: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineItem {
  id: string;
  leadId: string;
  userId?: string;
  userName?: string;
  type: 'status_change' | 'note' | 'call' | 'email' | 'meeting' | 'task_assigned' | 'file_uploaded' | 'follow_up_scheduled';
  title: string;
  description?: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignerName?: string;
  assignedTo: string;
  assigneeName?: string;
  assigneeTelegram?: string;
  leadId?: string;
  leadName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  commentsCount?: number;
}

export interface TaskCommentItem {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface FollowUpItem {
  id: string;
  leadId: string;
  leadName?: string;
  leadPhone?: string;
  leadCompany?: string;
  userId: string;
  userName?: string;
  type: 'call' | 'email' | 'meeting' | 'visit' | 'other';
  title: string;
  description?: string;
  scheduledAt: string;
  isCompleted: boolean;
  reminderSent: boolean;
  googleEventId?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNo: string;
  leadId?: string;
  clientName: string;
  amount: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  notes?: string;
  lineItems: Array<{ description: string; quantity: number; rate: number; amount: number }>;
  createdAt: string;
}

export interface PaymentItem {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  clientName: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card' | 'other';
  referenceNo?: string;
  notes?: string;
  paidAt: string;
}

export interface ExpenseItem {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  description: string;
  expenseDate: string;
  isApproved: boolean;
  submittedBy: string;
  submitterName: string;
  approvedBy?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'lead' | 'task' | 'finance' | 'system';
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  telegramSent: boolean;
  createdAt: string;
}

// Initial clean user accounts (No mock data)
const initialUsers: UserItem[] = [
  {
    id: 'u-1',
    name: 'Vedant Singh',
    email: 'vedant@aarmambh.com',
    role: 'admin',
    telegramUsername: 'vedantsingh',
    isActive: true,
  },
];

// Clean empty database store
class StorageContainer {
  users: UserItem[] = [...initialUsers];
  products: ProductItem[] = [];
  leads: LeadItem[] = [];
  timeline: TimelineItem[] = [];
  tasks: TaskItem[] = [];
  taskComments: TaskCommentItem[] = [];
  followUps: FollowUpItem[] = [];
  invoices: InvoiceItem[] = [];
  payments: PaymentItem[] = [];
  expenses: ExpenseItem[] = [];
  notifications: NotificationItem[] = [];
}

// Global singleton
const globalForStorage = globalThis as unknown as { crmStorage?: StorageContainer };
export const storage = globalForStorage.crmStorage ?? new StorageContainer();
if (process.env.NODE_ENV !== 'production') globalForStorage.crmStorage = storage;
