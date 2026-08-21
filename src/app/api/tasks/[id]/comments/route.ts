import { NextResponse } from 'next/server';
import { storage, TaskCommentItem } from '@/lib/storage';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = storage.taskComments.filter((c) => c.taskId === id);
  return NextResponse.json({ comments });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = storage.tasks.find((t) => t.id === id);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    if (!body.message) {
      return NextResponse.json({ error: 'Comment message is required' }, { status: 400 });
    }

    const newComment: TaskCommentItem = {
      id: `tc-${Date.now()}`,
      taskId: id,
      userId: body.userId || 'u-1',
      userName: body.userName || 'Team Member',
      message: body.message,
      createdAt: new Date().toISOString(),
    };

    storage.taskComments.push(newComment);
    task.commentsCount = (task.commentsCount || 0) + 1;

    return NextResponse.json({ success: true, comment: newComment });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Comment error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
