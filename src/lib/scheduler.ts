import { storage } from './storage';
import { telegram } from './telegram';

export async function processMorningBriefings(): Promise<{ processedCount: number }> {
  let count = 0;

  for (const user of storage.users) {
    if (!user.isActive) continue;

    // Get user's calls for today
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const userCalls = storage.followUps
      .filter((f) => {
        const scheduledTime = new Date(f.scheduledAt);
        return f.userId === user.id && scheduledTime >= startOfDay && scheduledTime <= endOfDay;
      })
      .map((f) => ({
        time: new Date(f.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        leadName: f.leadName || 'Client',
        company: f.leadCompany,
        notes: f.description,
      }));

    // Get user's tasks
    const userTasks = storage.tasks
      .filter((t) => t.assignedTo === user.id && t.status !== 'done')
      .map((t) => ({
        title: t.title,
        priority: t.priority,
      }));

    // Get overdue finance if admin
    let overdueSummary = undefined;
    if (user.role === 'admin') {
      const overdue = storage.invoices.filter((i) => i.status === 'overdue');
      if (overdue.length > 0) {
        overdueSummary = {
          count: overdue.length,
          totalAmount: overdue.reduce((sum, i) => sum + i.totalAmount, 0),
        };
      }
    }

    // Send Telegram Digest
    await telegram.sendMorningBriefing({
      userName: user.name,
      userTelegram: user.telegramUsername,
      callsToday: userCalls,
      tasksToday: userTasks,
      overdueInvoices: overdueSummary,
    });

    // Create In-App Notification
    storage.notifications.unshift({
      id: `notif-${Date.now()}-${user.id}`,
      userId: user.id,
      title: '☀️ Daily Morning Briefing',
      message: `You have ${userCalls.length} call(s) and ${userTasks.length} task(s) scheduled for today.`,
      type: 'system',
      isRead: false,
      telegramSent: true,
      createdAt: new Date().toISOString(),
    });

    count++;
  }

  return { processedCount: count };
}

export async function processPreCallReminders(): Promise<{ sentCount: number }> {
  let sentCount = 0;
  const now = Date.now();
  const windowStart = now;
  const windowEnd = now + 10 * 60 * 1000; // 10 minutes ahead

  for (const followUp of storage.followUps) {
    if (followUp.isCompleted || followUp.reminderSent) continue;

    const callTime = new Date(followUp.scheduledAt).getTime();

    if (callTime >= windowStart && callTime <= windowEnd) {
      // Find assigned user
      const user = storage.users.find((u) => u.id === followUp.userId);

      const formattedTime = new Date(followUp.scheduledAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // 1. Send Telegram Urgent Reminder
      await telegram.notifyPreCallReminder({
        leadName: followUp.leadName || 'Client Lead',
        leadPhone: followUp.leadPhone || '+91 98000 00000',
        leadCompany: followUp.leadCompany,
        notes: followUp.description,
        userName: user?.name || 'Agent',
        userTelegram: user?.telegramUsername,
        callTime: formattedTime,
      });

      // 2. Add In-App Notification
      if (user) {
        storage.notifications.unshift({
          id: `notif-${Date.now()}-${followUp.id}`,
          userId: user.id,
          title: `⏰ Call in 10 Min: ${followUp.leadName}`,
          message: `Scheduled call at ${formattedTime} with ${followUp.leadName} (${followUp.leadPhone})`,
          type: 'lead',
          referenceId: followUp.leadId,
          referenceType: 'lead',
          isRead: false,
          telegramSent: true,
          createdAt: new Date().toISOString(),
        });
      }

      // Mark reminder sent so we don't duplicate
      followUp.reminderSent = true;
      sentCount++;
    }
  }

  return { sentCount };
}
