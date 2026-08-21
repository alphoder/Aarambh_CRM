// Telegram Bot integration & Notification Service

export interface TelegramMessageOptions {
  chatId?: string;
  tagUsername?: string;
  parseMode?: 'HTML' | 'MarkdownV2' | 'Markdown';
}

export class TelegramService {
  private botToken: string;
  private defaultChatId: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.defaultChatId = process.env.TELEGRAM_DEFAULT_CHAT_ID || '';
  }

  // Format @tag mention for Telegram
  tagUser(telegramUsername?: string): string {
    if (!telegramUsername) return '';
    const clean = telegramUsername.replace(/^@/, '');
    return `@${clean}`;
  }

  // Send message to Telegram
  async sendMessage(
    text: string,
    options?: TelegramMessageOptions
  ): Promise<{ success: boolean; error?: string; messageId?: number }> {
    const token = this.botToken;
    const targetChatId = options?.chatId || this.defaultChatId;

    if (!token || !targetChatId) {
      console.log(`[Telegram Simulation] Target Chat: ${targetChatId || 'Default'}\nMessage:\n${text}`);
      return { success: true, messageId: Math.floor(Math.random() * 100000) };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: text,
          parse_mode: options?.parseMode || 'HTML',
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.description || 'Failed to send Telegram message');
      }

      return { success: true, messageId: data.result?.message_id };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown Telegram error';
      console.warn(`[Telegram Send Warning]: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  // Task Assigned Notification
  async notifyTaskAssigned(params: {
    taskTitle: string;
    assigneeName: string;
    assigneeTelegram?: string;
    assignerName: string;
    priority: string;
    dueDate?: string;
    leadName?: string;
  }) {
    const tag = this.tagUser(params.assigneeTelegram) || params.assigneeName;
    const priorityIcon =
      params.priority === 'urgent'
        ? '🔴'
        : params.priority === 'high'
        ? '🟠'
        : params.priority === 'medium'
        ? '🟡'
        : '🟢';

    const message = `
📋 <b>New Task Assigned</b>

Hello ${tag}, you have been assigned a new work item:
• <b>Task:</b> ${params.taskTitle}
• <b>Priority:</b> ${priorityIcon} ${params.priority.toUpperCase()}
• <b>Assigned By:</b> ${params.assignerName}
${params.leadName ? `• <b>Client/Lead:</b> ${params.leadName}\n` : ''}${
      params.dueDate ? `• <b>Due Date:</b> ${params.dueDate}\n` : ''
    }
<i>Check your Aarmambh Labs CRM dashboard for full details.</i>
`.trim();

    return this.sendMessage(message);
  }

  // Task Status Update Notification (sent to task creator)
  async notifyTaskStatusChanged(params: {
    taskTitle: string;
    assignerName: string;
    assignerTelegram?: string;
    updaterName: string;
    newStatus: string;
  }) {
    const tag = this.tagUser(params.assignerTelegram) || params.assignerName;
    const statusText =
      params.newStatus === 'done'
        ? '✅ COMPLETED'
        : params.newStatus === 'in_progress'
        ? '🔄 IN PROGRESS'
        : params.newStatus === 'blocked'
        ? '⛔ BLOCKED'
        : '📝 TO DO';

    const message = `
🔔 <b>Task Status Update</b>

${tag}, a task you created has been updated:
• <b>Task:</b> ${params.taskTitle}
• <b>Status:</b> ${statusText}
• <b>Updated By:</b> ${params.updaterName}
`.trim();

    return this.sendMessage(message);
  }

  // 10-Minute Pre-Call Reminder
  async notifyPreCallReminder(params: {
    leadName: string;
    leadPhone: string;
    leadCompany?: string;
    notes?: string;
    userName: string;
    userTelegram?: string;
    callTime: string;
  }) {
    const tag = this.tagUser(params.userTelegram) || params.userName;
    const message = `
⏰ <b>Call Reminder (in 10 Minutes!)</b>

${tag} — You have a scheduled call coming up!
• <b>Contact:</b> <b>${params.leadName}</b> ${params.leadCompany ? `(${params.leadCompany})` : ''}
• <b>Phone:</b> <code>${params.leadPhone}</code>
• <b>Scheduled Time:</b> ${params.callTime}
${params.notes ? `• <b>Key Notes:</b> ${params.notes}\n` : ''}
<i>Tap the phone number to call directly. Good luck closing! 🚀</i>
`.trim();

    return this.sendMessage(message);
  }

  // Daily Morning Briefing
  async sendMorningBriefing(params: {
    userName: string;
    userTelegram?: string;
    callsToday: Array<{ time: string; leadName: string; company?: string; notes?: string }>;
    tasksToday: Array<{ title: string; priority: string }>;
    overdueInvoices?: { count: number; totalAmount: number };
  }) {
    const tag = this.tagUser(params.userTelegram) || params.userName;

    let callsSection = '• <i>No scheduled calls today</i>';
    if (params.callsToday.length > 0) {
      callsSection = params.callsToday
        .map((c) => `• <b>${c.time}</b> — ${c.leadName} ${c.company ? `(${c.company})` : ''}`)
        .join('\n');
    }

    let tasksSection = '• <i>No pending tasks due today</i>';
    if (params.tasksToday.length > 0) {
      tasksSection = params.tasksToday
        .map((t) => `• [${t.priority.toUpperCase()}] ${t.title}`)
        .join('\n');
    }

    let financeSection = '';
    if (params.overdueInvoices && params.overdueInvoices.count > 0) {
      financeSection = `\n💰 <b>Finance Alert:</b>\n• ${params.overdueInvoices.count} invoice(s) overdue (₹${params.overdueInvoices.totalAmount.toLocaleString('en-IN')})\n`;
    }

    const message = `
☀️ <b>Good Morning, ${tag}!</b>
Here is your daily action plan from <b>Aarmambh Labs CRM</b>:

📞 <b>Calls Scheduled Today:</b>
${callsSection}

📋 <b>Tasks Due Today:</b>
${tasksSection}
${financeSection}
<i>Have an incredible and high-converting day! 🚀</i>
`.trim();

    return this.sendMessage(message);
  }
}

export const telegram = new TelegramService();
