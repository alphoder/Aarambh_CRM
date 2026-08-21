import { storage } from '../storage';

export function buildCRMContext(includeFinance: boolean = true): string {
  const leadsSummary = storage.leads.map((l) => ({
    id: l.id,
    name: l.name,
    company: l.company,
    designation: l.designation,
    phone: l.phone,
    email: l.email,
    city: l.city,
    state: l.state,
    status: l.status,
    product: l.productName,
    assignee: l.assigneeName,
    dealValue: l.value,
    notes: l.notes,
    createdAt: l.createdAt,
  }));

  const productsSummary = storage.products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
  }));

  const tasksSummary = storage.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    assignedTo: t.assigneeName,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate,
    lead: t.leadName,
  }));

  const followUpsSummary = storage.followUps.map((f) => ({
    lead: f.leadName,
    phone: f.leadPhone,
    type: f.type,
    time: f.scheduledAt,
    title: f.title,
    user: f.userName,
  }));

  let financeSummary = '';
  if (includeFinance) {
    const totalRevenue = storage.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = storage.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const overdueInvoices = storage.invoices.filter((i) => i.status === 'overdue');

    financeSummary = `
FINANCIAL METRICS:
- Total Paid Revenue: ₹${totalRevenue.toLocaleString('en-IN')}
- Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}
- Net Profit: ₹${netProfit.toLocaleString('en-IN')}
- Total Invoices: ${storage.invoices.length}
- Overdue Invoices: ${overdueInvoices.length} (Totaling ₹${overdueInvoices.reduce((s, i) => s + i.totalAmount, 0).toLocaleString('en-IN')})
- Recent Invoices: ${JSON.stringify(storage.invoices.slice(0, 5))}
`;
  }

  return `
CRM DATA SNAPSHOT:
------------------
PRODUCTS (${productsSummary.length}):
${JSON.stringify(productsSummary, null, 2)}

ACTIVE LEADS (${leadsSummary.length}):
${JSON.stringify(leadsSummary, null, 2)}

PENDING / ACTIVE TASKS (${tasksSummary.length}):
${JSON.stringify(tasksSummary, null, 2)}

UPCOMING SCHEDULED CALLS & FOLLOW-UPS (${followUpsSummary.length}):
${JSON.stringify(followUpsSummary, null, 2)}

${financeSummary}
`.trim();
}
