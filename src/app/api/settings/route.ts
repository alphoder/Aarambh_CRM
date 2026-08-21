import { NextResponse } from 'next/server';
import { storage, UserItem, ProductItem } from '@/lib/storage';
import { geminiPool } from '@/lib/gemini';

export async function GET() {
  return NextResponse.json({
    team: storage.users,
    products: storage.products,
    geminiKeyCount: geminiPool.getKeyCount(),
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    cronSecretConfigured: Boolean(process.env.CRON_SECRET),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Add/Invite Team Member
    if (body.action === 'add_user') {
      if (!body.name || !body.email) {
        return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
      }

      const newUser: UserItem = {
        id: `u-${Date.now()}`,
        name: body.name,
        email: body.email.toLowerCase().trim(),
        role: body.role || 'sales_executive',
        telegramUsername: body.telegramUsername?.replace(/^@/, '') || undefined,
        telegramChatId: body.telegramChatId || undefined,
        isActive: true,
      };

      storage.users.push(newUser);
      return NextResponse.json({ success: true, user: newUser });
    }

    // 2. Add Product to catalog
    if (body.action === 'add_product') {
      if (!body.name) {
        return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
      }

      const newProduct: ProductItem = {
        id: `p-${Date.now()}`,
        name: body.name,
        description: body.description || '',
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      storage.products.push(newProduct);
      return NextResponse.json({ success: true, product: newProduct });
    }

    // 3. Add Gemini API Key to rotation pool
    if (body.action === 'add_gemini_key') {
      if (!body.apiKey) {
        return NextResponse.json({ error: 'API key is required' }, { status: 400 });
      }

      geminiPool.addKey(body.apiKey);
      return NextResponse.json({ success: true, count: geminiPool.getKeyCount() });
    }

    // 4. Toggle User status
    if (body.action === 'toggle_user') {
      const user = storage.users.find((u) => u.id === body.userId);
      if (user) {
        user.isActive = !user.isActive;
        return NextResponse.json({ success: true, user });
      }
    }

    return NextResponse.json({ error: 'Invalid settings action' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Settings error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
