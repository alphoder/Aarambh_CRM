import { NextResponse } from 'next/server';
import { storage, TaskItem } from '@/lib/storage';
import { telegram } from '@/lib/telegram';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const assignedTo = searchParams.get('assignedTo');
  const leadId = searchParams.get('leadId');

  let results = [...storage.tasks];

  if (status && status !== 'all') {
    results = results.filter((t) => t.status === status);
  }
  if (priority && priority !== 'all') {
    results = results.filter((t) => t.priority === priority);
  }
  if (assignedTo && assignedTo !== 'all') {
    results = results.filter((t) => t.assignedTo === assignedTo);
  }
  if (leadId) {
    results = results.filter((t) => t.leadId === leadId);
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    tasks: results,
    total: results.length,
    team: storage.users,
    leads: storage.leads.map((l) => ({ id: l.id, name: l.name, company: l.company })),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.assignedTo) {
      return NextResponse.json(
        { error: 'Task title and assigned teammate are required' },
        { status: 400 }
      );
    }

    const assignee = storage.users.find((u) => u.id === body.assignedTo);
    const assigner = storage.users.find((u) => u.id === body.assignedBy) || storage.users[0];
    const lead = body.leadId ? storage.leads.find((l) => l.id === body.leadId) : undefined;

    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      title: body.title,
      description: body.description || '',
      assignedBy: assigner.id,
      assignerName: assigner.name,
      assignedTo: body.assignedTo,
      assigneeName: assignee?.name || 'Teammate',
      assigneeTelegram: assignee?.telegramUsername,
      leadId: body.leadId || undefined,
      leadName: lead ? `${lead.name} (${lead.company})` : undefined,
      priority: body.priority || 'medium',
      status: 'todo',
      dueDate: body.dueDate || undefined,
      createdAt: new Date().toISOString(),
      commentsCount: 0,
    };

    storage.tasks.unshift(newTask);

    // 1. Trigger Telegram @username Tag Notification to Assignee
    await telegram.notifyTaskAssigned({
      taskTitle: newTask.title,
      assigneeName: newTask.assigneeName || 'Teammate',
      assigneeTelegram: assignee?.telegramUsername,
      assignerName: assigner.name,
      priority: newTask.priority,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toLocaleDateString('en-IN') : undefined,
      leadName: newTask.leadName,
    });

    // 2. Add In-App Notification for Assignee
    if (assignee) {
      storage.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: assignee.id,
        title: '📋 New Task Assigned',
        message: `@${assigner.name} assigned you: "${newTask.title}" [Priority: ${newTask.priority.toUpperCase()}]`,
        type: 'task',
        referenceId: newTask.id,
        referenceType: 'task',
        isRead: false,
        telegramSent: true,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Add to lead timeline if linked
    if (lead) {
      storage.timeline.unshift({
        id: `t-${Date.now()}`,
        leadId: lead.id,
        userName: assigner.name,
        type: 'task_assigned',
        title: `Task Assigned: ${newTask.title}`,
        description: `Assigned to ${newTask.assigneeName} with priority ${newTask.priority}`,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, task: newTask });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Task creation error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
