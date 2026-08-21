// Unified storage layer: reads/writes to Neon PostgreSQL via Drizzle when DATABASE_URL is present,
// and falls back gracefully to initialized seed data for instant development and testing.

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

// Initial In-Memory Seed Data
const initialUsers: UserItem[] = [
  {
    id: 'u-1',
    name: 'Admin User',
    email: 'admin@aarmambh.com',
    role: 'admin',
    telegramUsername: 'aarmambh_admin',
    telegramChatId: '987654321',
    isActive: true,
  },
  {
    id: 'u-2',
    name: 'Vedant Singh',
    email: 'vedant@aarmambh.com',
    role: 'admin',
    telegramUsername: 'vedantsingh',
    telegramChatId: '987654322',
    isActive: true,
  },
  {
    id: 'u-3',
    name: 'Rahul Sharma',
    email: 'rahul@aarmambh.com',
    role: 'sales_executive',
    telegramUsername: 'rahul_sales',
    telegramChatId: '987654323',
    isActive: true,
  },
  {
    id: 'u-4',
    name: 'Priya Patel',
    email: 'priya@aarmambh.com',
    role: 'sales_executive',
    telegramUsername: 'priya_p',
    telegramChatId: '987654324',
    isActive: true,
  },
];

const initialProducts: ProductItem[] = [
  {
    id: 'p-1',
    name: 'Enterprise AI Suite',
    description: 'Custom AI agent deployment and document automation for enterprises',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-2',
    name: 'Aarmambh Cloud CRM',
    description: 'Cloud based multi-account CRM with automated telegram reminders',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-3',
    name: 'Data Analytics Pipeline',
    description: 'Real-time ETL data transformation and business intelligence reports',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-4',
    name: 'WhatsApp & Telegram Automation',
    description: 'Omnichannel bot workflows and notification pipelines',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const initialLeads: LeadItem[] = [
  {
    id: 'l-1',
    name: 'Amitabh Verma',
    email: 'amitabh@apextech.in',
    phone: '+91 98201 12345',
    company: 'Apex Tech Solutions',
    designation: 'Chief Technology Officer',
    city: 'Mumbai',
    state: 'Maharashtra',
    status: 'proposal',
    source: 'website',
    productId: 'p-1',
    productName: 'Enterprise AI Suite',
    assignedTo: 'u-2',
    assigneeName: 'Vedant Singh',
    notes: 'Interested in automated lead classification using Gemini Flash Lite.',
    value: 250000,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'l-2',
    name: 'Sunita Rao',
    email: 'sunita.rao@zenithlogistics.com',
    phone: '+91 98450 67890',
    company: 'Zenith Logistics',
    designation: 'Head of Operations',
    city: 'Bengaluru',
    state: 'Karnataka',
    status: 'qualified',
    source: 'upload',
    productId: 'p-2',
    productName: 'Aarmambh Cloud CRM',
    assignedTo: 'u-3',
    assigneeName: 'Rahul Sharma',
    notes: 'Uploaded via logistics contact sheet. Needs scheduled calls reminder on Telegram.',
    value: 180000,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'l-3',
    name: 'Vikram Malhotra',
    email: 'vikram@malhotrainfra.com',
    phone: '+91 98110 54321',
    company: 'Malhotra Infrastructure Ltd',
    designation: 'Managing Director',
    city: 'New Delhi',
    state: 'Delhi',
    status: 'won',
    source: 'referral',
    productId: 'p-1',
    productName: 'Enterprise AI Suite',
    assignedTo: 'u-2',
    assigneeName: 'Vedant Singh',
    notes: 'Contract signed for 1 year enterprise deployment. Invoice INV-202608-001 generated.',
    value: 500000,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'l-4',
    name: 'Neha Deshmukh',
    email: 'neha.d@fintechglobal.io',
    phone: '+91 99300 99887',
    company: 'FinTech Global Labs',
    designation: 'VP of Product',
    city: 'Pune',
    state: 'Maharashtra',
    status: 'contacted',
    source: 'social_media',
    productId: 'p-3',
    productName: 'Data Analytics Pipeline',
    assignedTo: 'u-4',
    assigneeName: 'Priya Patel',
    notes: 'Requested product walkthrough. Meeting scheduled via Google Calendar.',
    value: 120000,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'l-5',
    name: 'Karan Mehra',
    email: 'karan@nexusretail.com',
    phone: '+91 97170 33221',
    company: 'Nexus Retail Chains',
    designation: 'Director of Growth',
    city: 'Gurugram',
    state: 'Haryana',
    status: 'new',
    source: 'upload',
    productId: 'p-4',
    productName: 'WhatsApp & Telegram Automation',
    assignedTo: 'u-3',
    assigneeName: 'Rahul Sharma',
    notes: 'Imported from PDF lead list. Needs initial discovery call.',
    value: 95000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialTimeline: TimelineItem[] = [
  {
    id: 't-1',
    leadId: 'l-1',
    userName: 'Vedant Singh',
    type: 'meeting',
    title: 'Product Demonstration & Technical Discussion',
    description: 'Showcased Gemini document extraction pipeline and high-speed JSON output.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 't-2',
    leadId: 'l-1',
    userName: 'Vedant Singh',
    type: 'status_change',
    title: 'Status changed to Proposal Sent',
    description: 'Commercial proposal of ₹2,50,000 sent with custom SLM router.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 't-3',
    leadId: 'l-3',
    userName: 'Vedant Singh',
    type: 'status_change',
    title: 'Deal Closed — Won!',
    description: 'Agreement signed. Advance payment of ₹2,50,000 received via Bank Transfer.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

const initialTasks: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'Share updated commercial proposal with Amitabh Verma',
    description: 'Include 10% discount on Gemini Flash API key token tier and SLA details.',
    assignedBy: 'u-1',
    assignerName: 'Admin User',
    assignedTo: 'u-2',
    assigneeName: 'Vedant Singh',
    assigneeTelegram: 'vedantsingh',
    leadId: 'l-1',
    leadName: 'Apex Tech Solutions',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    commentsCount: 2,
  },
  {
    id: 'tsk-2',
    title: 'Conduct discovery call with Sunita Rao',
    description: 'Verify logistics document formats (Waybills, Invoices) for AI parser.',
    assignedBy: 'u-2',
    assignerName: 'Vedant Singh',
    assignedTo: 'u-3',
    assigneeName: 'Rahul Sharma',
    assigneeTelegram: 'rahul_sales',
    leadId: 'l-2',
    leadName: 'Zenith Logistics',
    priority: 'high',
    status: 'todo',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    commentsCount: 0,
  },
  {
    id: 'tsk-3',
    title: 'Prepare onboarding documentation for Malhotra Infra',
    description: 'Generate user credentials and configure Google Calendar sync webhook.',
    assignedBy: 'u-2',
    assignerName: 'Vedant Singh',
    assignedTo: 'u-4',
    assigneeName: 'Priya Patel',
    assigneeTelegram: 'priya_p',
    leadId: 'l-3',
    leadName: 'Malhotra Infrastructure Ltd',
    priority: 'medium',
    status: 'done',
    completedAt: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    commentsCount: 1,
  },
];

const initialFollowUps: FollowUpItem[] = [
  {
    id: 'fu-1',
    leadId: 'l-1',
    leadName: 'Amitabh Verma',
    leadPhone: '+91 98201 12345',
    leadCompany: 'Apex Tech Solutions',
    userId: 'u-2',
    userName: 'Vedant Singh',
    type: 'call',
    title: 'Proposal Review & Discount Negotiation',
    description: 'Follow up on the ₹2.5L proposal sent yesterday.',
    scheduledAt: new Date(Date.now() + 45 * 60000).toISOString(), // 45 mins from now
    isCompleted: false,
    reminderSent: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fu-2',
    leadId: 'l-2',
    leadName: 'Sunita Rao',
    leadPhone: '+91 98450 67890',
    leadCompany: 'Zenith Logistics',
    userId: 'u-3',
    userName: 'Rahul Sharma',
    type: 'call',
    title: 'Product Scope & API Discussion',
    description: 'Discuss parsing capabilities for PDF logistics manifests.',
    scheduledAt: new Date(Date.now() + 3 * 3600000).toISOString(),
    isCompleted: false,
    reminderSent: false,
    createdAt: new Date().toISOString(),
  },
];

const initialInvoices: InvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-202608-001',
    leadId: 'l-3',
    clientName: 'Malhotra Infrastructure Ltd',
    amount: 500000,
    tax: 90000,
    discount: 25000,
    totalAmount: 565000,
    status: 'paid',
    dueDate: '2026-09-15',
    paidAt: new Date().toISOString(),
    notes: 'Annual Enterprise AI Deployment & Dedicated Server Instance',
    lineItems: [
      { description: 'Enterprise AI Suite License (Annual)', quantity: 1, rate: 450000, amount: 450000 },
      { description: 'Dedicated SLM Routing Setup & Training', quantity: 1, rate: 50000, amount: 50000 },
    ],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-202608-002',
    leadId: 'l-1',
    clientName: 'Apex Tech Solutions',
    amount: 250000,
    tax: 45000,
    discount: 0,
    totalAmount: 295000,
    status: 'sent',
    dueDate: '2026-08-30',
    notes: 'Q3 Enterprise Deployment Phase 1',
    lineItems: [
      { description: 'Aarmambh CRM Multi-Account Deployment', quantity: 1, rate: 250000, amount: 250000 },
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'inv-3',
    invoiceNo: 'INV-202607-009',
    clientName: 'Quantum Media Corp',
    amount: 145000,
    tax: 26100,
    discount: 0,
    totalAmount: 171100,
    status: 'overdue',
    dueDate: '2026-08-10',
    notes: 'Automated Lead Extraction Pipeline',
    lineItems: [
      { description: 'Custom Parsing Bot & API setup', quantity: 1, rate: 145000, amount: 145000 },
    ],
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

const initialPayments: PaymentItem[] = [
  {
    id: 'pay-1',
    invoiceId: 'inv-1',
    invoiceNo: 'INV-202608-001',
    clientName: 'Malhotra Infrastructure Ltd',
    amount: 565000,
    method: 'bank_transfer',
    referenceNo: 'HDFC-NEFT-99881122',
    notes: 'Full payment received against INV-202608-001',
    paidAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

const initialExpenses: ExpenseItem[] = [
  {
    id: 'exp-1',
    categoryId: 'ec-1',
    categoryName: 'Cloud & Infrastructure',
    amount: 42000,
    description: 'Neon PostgreSQL enterprise compute and Gemini API token consumption',
    expenseDate: '2026-08-15',
    isApproved: true,
    submittedBy: 'u-2',
    submitterName: 'Vedant Singh',
    approvedBy: 'u-1',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'exp-2',
    categoryId: 'ec-2',
    categoryName: 'Marketing & Lead Generation',
    amount: 28500,
    description: 'LinkedIn B2B campaign and event sponsor booth',
    expenseDate: '2026-08-18',
    isApproved: true,
    submittedBy: 'u-3',
    submitterName: 'Rahul Sharma',
    approvedBy: 'u-2',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'u-2',
    title: 'New Lead Assigned',
    message: 'Amitabh Verma (Apex Tech Solutions) was assigned to you.',
    type: 'lead',
    referenceId: 'l-1',
    referenceType: 'lead',
    isRead: false,
    telegramSent: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'u-2',
    title: 'Task Assigned',
    message: '@admin assigned you: "Share updated commercial proposal with Amitabh Verma"',
    type: 'task',
    referenceId: 'tsk-1',
    referenceType: 'task',
    isRead: false,
    telegramSent: true,
    createdAt: new Date().toISOString(),
  },
];

// Persistent In-Memory State container
class StorageContainer {
  users: UserItem[] = [...initialUsers];
  products: ProductItem[] = [...initialProducts];
  leads: LeadItem[] = [...initialLeads];
  timeline: TimelineItem[] = [...initialTimeline];
  tasks: TaskItem[] = [...initialTasks];
  taskComments: TaskCommentItem[] = [];
  followUps: FollowUpItem[] = [...initialFollowUps];
  invoices: InvoiceItem[] = [...initialInvoices];
  payments: PaymentItem[] = [...initialPayments];
  expenses: ExpenseItem[] = [...initialExpenses];
  notifications: NotificationItem[] = [...initialNotifications];
}

// Global singleton
const globalForStorage = globalThis as unknown as { crmStorage?: StorageContainer };
export const storage = globalForStorage.crmStorage ?? new StorageContainer();
if (process.env.NODE_ENV !== 'production') globalForStorage.crmStorage = storage;
