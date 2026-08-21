import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { telegram } from '@/lib/telegram';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = storage.tasks.find((t) => t.id === id);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const comments = storage.taskComments.filter((c) => c.taskId === id);

  return NextResponse.json({ task, comments });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = storage.tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const existing = storage.tasks[index];

    // Status change handling
    if (body.status && body.status !== existing.status) {
      if (body.status === 'done') {
        existing.completedAt = new Date().toISOString();
      }

      // Notify task creator on Telegram
      const assigner = storage.users.find((u) => u.id === existing.assignedBy);
      await telegram.notifyTaskStatusChanged({
        taskTitle: existing.title,
        assignerName: existing.assignerName || 'Assigner',
        assignerTelegram: assigner?.telegramUsername,
        updaterName: body.updaterName || 'Teammate',
        newStatus: body.status,
      });

      // Add notification for creator
      if (assigner) {
        storage.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: assigner.id,
          title: `Task Status: ${body.status.toUpperCase()}`,
          message: `Task "${existing.title}" was marked as ${body.status} by ${body.updaterName || 'Teammate'}`,
          type: 'task',
          referenceId: existing.id,
          referenceType: 'task',
          isRead: false,
          telegramSent: true,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const updated = {
      ...existing,
      ...body,
    };

    storage.tasks[index] = updated;

    return NextResponse.json({ success: true, task: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Task update error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = storage.tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  storage.tasks.splice(index, 1);
  return NextResponse.json({ success: true });
}
