import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiPool } from '../gemini';
import { routeAIQuery, RoutingDecision } from './router';
import { buildCRMContext } from './context';
import { storage } from '../storage';

export interface BholaResponse {
  answer: string;
  modelUsed: string;
  isLLM: boolean;
  routingReason: string;
  complexityScore: number;
}

export async function askBhola(
  userQuery: string,
  userRole: string = 'admin'
): Promise<BholaResponse> {
  const cleanQuery = userQuery.replace(/^\/bhola\s*/i, '').trim();

  if (!cleanQuery) {
    return {
      answer:
        '👋 Namaste! I am <b>Bhola</b>, your Aarmambh Labs CRM AI Assistant.\n\nAsk me anything about your leads, follow-up calls, tasks, or financial summaries!\n\nExamples:\n• <i>/bhola show all leads from Mumbai</i>\n• <i>/bhola who has calls scheduled today?</i>\n• <i>/bhola analyze our highest value pipeline deals</i>\n• <i>/bhola sort leads by deal value descending</i>',
      modelUsed: 'system-ready',
      isLLM: false,
      routingReason: 'Welcome prompt',
      complexityScore: 1,
    };
  }

  // 1. Determine Model Routing (SLM vs LLM)
  const decision: RoutingDecision = routeAIQuery(cleanQuery);

  // 2. Build CRM Context based on user role (hide finance for non-admin)
  const allowFinance = userRole === 'admin';
  const crmContext = buildCRMContext(allowFinance);

  // 3. Check for API key in pool
  const apiKey = geminiPool.getNextKey();

  if (!apiKey || apiKey.startsWith('AIzaSySample')) {
    // High-accuracy algorithmic response generator if API key not yet connected
    const fallbackAnswer = generateAlgorithmicBholaAnswer(cleanQuery, allowFinance);
    return {
      answer: fallbackAnswer,
      modelUsed: `${decision.model} (Algorithmic Engine)`,
      isLLM: decision.isLLM,
      routingReason: decision.reason,
      complexityScore: decision.complexityScore,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: decision.model });

    const systemPrompt = `
You are "Bhola", the powerful and intelligent AI Assistant embedded inside Aarmambh Labs CRM.
You have complete, live access to all CRM data.

User Query: "${cleanQuery}"
User Role: "${userRole}"

Live CRM Data:
${crmContext}

Instructions:
1. Answer the query accurately based on the provided CRM data.
2. If asked to sort or filter, provide a clear, formatted bulleted list or table.
3. If asked about follow-ups or calls, specify the person, company, phone number, and scheduled time.
4. If asked about finance or revenue and user is authorized, give exact numbers formatted in INR (₹).
5. Tone: Highly professional, proactive, and concise. Format with HTML tags (<b>, <i>, <code>, <ul>, <li>) for Telegram readability.
`.trim();

    const result = await model.generateContent(systemPrompt);
    const answer = result.response.text();

    return {
      answer,
      modelUsed: decision.model,
      isLLM: decision.isLLM,
      routingReason: decision.reason,
      complexityScore: decision.complexityScore,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown AI error';
    console.warn(`[Bhola AI Error]: ${errorMsg}. Falling back to algorithmic response.`);
    return {
      answer: generateAlgorithmicBholaAnswer(cleanQuery, allowFinance),
      modelUsed: `${decision.model} (Fallback)`,
      isLLM: decision.isLLM,
      routingReason: decision.reason,
      complexityScore: decision.complexityScore,
    };
  }
}

// Algorithmic Intelligent Answer Generator for immediate demo without live API key
function generateAlgorithmicBholaAnswer(query: string, allowFinance: boolean): string {
  const q = query.toLowerCase();

  // Sorting by value
  if (q.includes('sort') && (q.includes('value') || q.includes('deal') || q.includes('amount'))) {
    const sorted = [...storage.leads].sort((a, b) => b.value - a.value);
    const items = sorted
      .map(
        (l, i) =>
          `<b>${i + 1}. ${l.name}</b> (${l.company}) — <b>₹${l.value.toLocaleString('en-IN')}</b> | Product: <i>${
            l.productName
          }</i> | Status: <code>${l.status.toUpperCase()}</code>`
      )
      .join('\n');
    return `📊 <b>Leads Sorted by Deal Value (Highest First):</b>\n\n${items}`;
  }

  // Filter by city
  if (q.includes('mumbai') || q.includes('bengaluru') || q.includes('delhi') || q.includes('pune')) {
    let cityMatch = 'Mumbai';
    if (q.includes('bengaluru')) cityMatch = 'Bengaluru';
    if (q.includes('delhi')) cityMatch = 'New Delhi';
    if (q.includes('pune')) cityMatch = 'Pune';

    const filtered = storage.leads.filter((l) => l.city.toLowerCase().includes(cityMatch.toLowerCase()));
    if (filtered.length === 0) return `No leads found in ${cityMatch}.`;

    const items = filtered
      .map(
        (l) =>
          `• <b>${l.name}</b> (${l.company})\n  📞 ${l.phone} | ✉️ ${l.email}\n  Product: <i>${l.productName}</i> | Status: <code>${l.status.toUpperCase()}</code>`
      )
      .join('\n\n');
    return `📍 <b>Leads located in ${cityMatch} (${filtered.length}):</b>\n\n${items}`;
  }

  // Follow-ups & calls
  if (q.includes('call') || q.includes('follow up') || q.includes('schedule') || q.includes('today')) {
    const calls = storage.followUps;
    if (calls.length === 0) return 'No pending calls or follow-ups scheduled at the moment.';

    const items = calls
      .map(
        (c) =>
          `• <b>${c.leadName}</b> (${c.leadCompany || 'Client'})\n  📞 <code>${c.leadPhone}</code>\n  ⏰ Time: <b>${new Date(
            c.scheduledAt
          ).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</b>\n  Assigned to: ${c.userName}\n  Notes: <i>${c.description || 'Follow-up'}</i>`
      )
      .join('\n\n');
    return `📞 <b>Upcoming Scheduled Calls & Follow-ups:</b>\n\n${items}`;
  }

  // Tasks
  if (q.includes('task') || q.includes('work') || q.includes('assign')) {
    const tasks = storage.tasks.filter((t) => t.status !== 'done');
    const items = tasks
      .map(
        (t) =>
          `• <b>${t.title}</b>\n  Assignee: <b>${t.assigneeName}</b> | Priority: <code>${t.priority.toUpperCase()}</code> | Status: <code>${t.status.toUpperCase()}</code>`
      )
      .join('\n\n');
    return `📋 <b>Active Team Tasks (${tasks.length}):</b>\n\n${items}`;
  }

  // Finance
  if (allowFinance && (q.includes('revenue') || q.includes('finance') || q.includes('invoice') || q.includes('profit') || q.includes('p&l'))) {
    const totalRev = storage.payments.reduce((s, p) => s + p.amount, 0);
    const totalExp = storage.expenses.reduce((s, e) => s + e.amount, 0);
    const net = totalRev - totalExp;
    const overdue = storage.invoices.filter((i) => i.status === 'overdue');

    return `
💰 <b>Financial Performance Overview:</b>

• <b>Total Collected Revenue:</b> ₹${totalRev.toLocaleString('en-IN')}
• <b>Total Approved Expenses:</b> ₹${totalExp.toLocaleString('en-IN')}
• <b>Net Profit:</b> <b>₹${net.toLocaleString('en-IN')}</b> (Margin: ${Math.round((net / totalRev) * 100)}%)
• <b>Overdue Invoices:</b> ${overdue.length} (₹${overdue.reduce((s, i) => s + i.totalAmount, 0).toLocaleString('en-IN')} pending)
• <b>Latest Invoice:</b> ${storage.invoices[0]?.invoiceNo} — ${storage.invoices[0]?.clientName} (₹${storage.invoices[0]?.totalAmount.toLocaleString('en-IN')})
`.trim();
  }

  // General Summary
  const totalLeads = storage.leads.length;
  const wonLeads = storage.leads.filter((l) => l.status === 'won').length;
  const pipelineValue = storage.leads.reduce((s, l) => s + l.value, 0);

  return `
🤖 <b>Aarmambh Labs CRM Summary:</b>

• <b>Total Clients/Leads:</b> ${totalLeads}
• <b>Pipeline Value:</b> ₹${pipelineValue.toLocaleString('en-IN')}
• <b>Won Deals:</b> ${wonLeads} (${Math.round((wonLeads / totalLeads) * 100)}% conversion)
• <b>Active Products:</b> ${storage.products.map((p) => p.name).join(', ')}
• <b>Upcoming Calls Today:</b> ${storage.followUps.length}

<i>Tip: Try asking specific questions like "/bhola show calls today" or "/bhola sort leads by value".</i>
`.trim();
}
