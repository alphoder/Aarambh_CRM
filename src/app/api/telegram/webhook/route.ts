import { NextResponse } from 'next/server';
import { askBhola } from '@/lib/ai/bhola';
import { telegram } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify if it's a standard Telegram message payload
    const message = body.message || body.channel_post;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true, status: 'no_message_text' });
    }

    const text = message.text.trim();
    const chatId = message.chat.id.toString();

    // Check if the user used /bhola or sent a message in a private chat
    if (text.startsWith('/bhola') || message.chat.type === 'private') {
      const query = text.startsWith('/bhola') ? text.slice(6).trim() : text;

      // 1. Process with /bhola AI Router
      const result = await askBhola(query, 'admin');

      // 2. Format response for Telegram
      const replyText = `
${result.answer}

<i>[Engine: ${result.modelUsed} • Complexity: ${result.complexityScore}/10]</i>
`.trim();

      // 3. Dispatch back to Telegram chat
      await telegram.sendMessage(replyText, {
        chatId: chatId,
        parseMode: 'HTML',
      });

      return NextResponse.json({
        ok: true,
        handled: true,
        model: result.modelUsed,
      });
    }

    return NextResponse.json({ ok: true, status: 'ignored_non_bhola_message' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Webhook error';
    console.error(`[Telegram Webhook Error]: ${errorMsg}`);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 200 });
  }
}
