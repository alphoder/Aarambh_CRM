import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  pgEnum,
  integer,
  boolean,
  decimal,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ========================================
// ENUMS
// ========================================
export const userRoleEnum = pgEnum('user_role', ['admin', 'sales_executive']);

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
]);

export const leadSourceEnum = pgEnum('lead_source', [
  'manual',
  'upload',
  'referral',
  'website',
  'social_media',
  'cold_call',
  'other',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'todo',
  'in_progress',
  'done',
  'blocked',
]);

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'bank_transfer',
  'upi',
  'cheque',
  'card',
  'other',
]);

export const timelineTypeEnum = pgEnum('timeline_type', [
  'status_change',
  'note',
  'call',
  'email',
  'meeting',
  'task_assigned',
  'file_uploaded',
  'follow_up_scheduled',
]);

export const followUpTypeEnum = pgEnum('follow_up_type', [
  'call',
  'email',
  'meeting',
  'visit',
  'other',
]);

// ========================================
// USERS & AUTH
// ========================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull().default('sales_executive'),
  avatar: text('avatar'),
  telegramUsername: varchar('telegram_username', { length: 100 }),
  telegramChatId: varchar('telegram_chat_id', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires').notNull(),
});

// ========================================
// PRODUCTS
// ========================================
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// LEADS
// ========================================
export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  designation: varchar('designation', { length: 255 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  status: leadStatusEnum('status').notNull().default('new'),
  source: leadSourceEnum('source').notNull().default('manual'),
  productId: uuid('product_id').references(() => products.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
  notes: text('notes'),
  value: decimal('value', { precision: 12, scale: 2 }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ========================================
// LEAD TIMELINE
// ========================================
export const leadTimeline = pgTable('lead_timeline', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  type: timelineTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  metadata: text('metadata'), // JSON string for extra data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// LEAD FILES
// ========================================
export const leadFiles = pgTable('lead_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: varchar('file_type', { length: 50 }),
  fileSize: integer('file_size'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// FOLLOW-UPS
// ========================================
export const followUps = pgTable('follow_ups', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  type: followUpTypeEnum('type').notNull().default('call'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  scheduledAt: timestamp('scheduled_at').notNull(),
  completedAt: timestamp('completed_at'),
  isCompleted: boolean('is_completed').notNull().default(false),
  reminderSent: boolean('reminder_sent').notNull().default(false),
  googleEventId: varchar('google_event_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// TASKS
// ========================================
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  assignedBy: uuid('assigned_by')
    .notNull()
    .references(() => users.id),
  assignedTo: uuid('assigned_to')
    .notNull()
    .references(() => users.id),
  leadId: uuid('lead_id').references(() => leads.id),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  status: taskStatusEnum('status').notNull().default('todo'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const taskComments = pgTable('task_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// NOTIFICATIONS
// ========================================
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // lead, task, finance, system
  referenceId: uuid('reference_id'), // link to lead/task/invoice
  referenceType: varchar('reference_type', { length: 50 }), // lead, task, invoice
  isRead: boolean('is_read').notNull().default(false),
  telegramSent: boolean('telegram_sent').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// API KEYS (Gemini)
// ========================================
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: varchar('provider', { length: 50 }).notNull().default('gemini'),
  apiKey: text('api_key').notNull(),
  label: varchar('label', { length: 100 }),
  usageCount: integer('usage_count').notNull().default(0),
  lastUsedAt: timestamp('last_used_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// SETTINGS
// ========================================
export const settings = pgTable('settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  description: varchar('description', { length: 255 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ========================================
// INVOICES
// ========================================
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceNo: varchar('invoice_no', { length: 50 }).notNull().unique(),
  leadId: uuid('lead_id').references(() => leads.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 12, scale: 2 }).default('0'),
  discount: decimal('discount', { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: invoiceStatusEnum('status').notNull().default('draft'),
  dueDate: date('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  notes: text('notes'),
  lineItems: text('line_items'), // JSON string
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ========================================
// PAYMENTS
// ========================================
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum('method').notNull(),
  referenceNo: varchar('reference_no', { length: 100 }),
  notes: text('notes'),
  paidAt: timestamp('paid_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// EXPENSES
// ========================================
export const expenseCategories = pgTable('expense_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  budgetLimit: decimal('budget_limit', { precision: 12, scale: 2 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => expenseCategories.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  receiptUrl: text('receipt_url'),
  expenseDate: date('expense_date').notNull(),
  approvedBy: uuid('approved_by').references(() => users.id),
  isApproved: boolean('is_approved').notNull().default(false),
  submittedBy: uuid('submitted_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// RELATIONS
// ========================================
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads, { relationName: 'assignedLeads' }),
  createdLeads: many(leads, { relationName: 'createdLeads' }),
  tasks: many(tasks, { relationName: 'assignedTasks' }),
  assignedTasks: many(tasks, { relationName: 'createdTasks' }),
  notifications: many(notifications),
  followUps: many(followUps),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  product: one(products, { fields: [leads.productId], references: [products.id] }),
  assignee: one(users, { fields: [leads.assignedTo], references: [users.id], relationName: 'assignedLeads' }),
  creator: one(users, { fields: [leads.createdBy], references: [users.id], relationName: 'createdLeads' }),
  timeline: many(leadTimeline),
  files: many(leadFiles),
  followUps: many(followUps),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assigner: one(users, { fields: [tasks.assignedBy], references: [users.id], relationName: 'createdTasks' }),
  assignee: one(users, { fields: [tasks.assignedTo], references: [users.id], relationName: 'assignedTasks' }),
  lead: one(leads, { fields: [tasks.leadId], references: [leads.id] }),
  comments: many(taskComments),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, { fields: [taskComments.taskId], references: [tasks.id] }),
  user: one(users, { fields: [taskComments.userId], references: [users.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  lead: one(leads, { fields: [invoices.leadId], references: [leads.id] }),
  creator: one(users, { fields: [invoices.createdBy], references: [users.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type Product = typeof products.$inferSelect;
export type FollowUp = typeof followUps.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
