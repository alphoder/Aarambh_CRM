import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  const totalLeads = storage.leads.length;
  const wonLeads = storage.leads.filter((l) => l.status === 'won').length;
  const lostLeads = storage.leads.filter((l) => l.status === 'lost').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const totalPipelineValue = storage.leads.reduce((s, l) => s + l.value, 0);

  // 1. Lead Funnel (Exact live counts)
  const funnelStages = [
    {
      stage: 'New Leads',
      count: storage.leads.filter((l) => l.status === 'new').length,
      value: storage.leads.filter((l) => l.status === 'new').reduce((s, l) => s + l.value, 0),
    },
    {
      stage: 'Contacted',
      count: storage.leads.filter((l) => l.status === 'contacted').length,
      value: storage.leads.filter((l) => l.status === 'contacted').reduce((s, l) => s + l.value, 0),
    },
    {
      stage: 'Qualified',
      count: storage.leads.filter((l) => l.status === 'qualified').length,
      value: storage.leads.filter((l) => l.status === 'qualified').reduce((s, l) => s + l.value, 0),
    },
    {
      stage: 'Proposal Sent',
      count: storage.leads.filter((l) => l.status === 'proposal').length,
      value: storage.leads.filter((l) => l.status === 'proposal').reduce((s, l) => s + l.value, 0),
    },
    {
      stage: 'Deals Won',
      count: wonLeads,
      value: storage.leads.filter((l) => l.status === 'won').reduce((s, l) => s + l.value, 0),
    },
  ];

  // 2. Sources Distribution
  const sourcesMap: Record<string, number> = {};
  for (const lead of storage.leads) {
    const src = lead.source.replace('_', ' ').toUpperCase();
    sourcesMap[src] = (sourcesMap[src] || 0) + 1;
  }
  const sourceData = Object.entries(sourcesMap).map(([name, count]) => ({
    name,
    count,
  }));

  // 3. Product Distribution
  const productMap: Record<string, number> = {};
  for (const lead of storage.leads) {
    const prod = lead.productName || 'General Product';
    productMap[prod] = (productMap[prod] || 0) + 1;
  }
  const productData = Object.entries(productMap).map(([name, count]) => ({
    name,
    count,
  }));

  // 4. Team Performance Leaderboard
  const teamPerformance = storage.users.map((u) => {
    const assignedLeads = storage.leads.filter((l) => l.assignedTo === u.id);
    const wonCount = assignedLeads.filter((l) => l.status === 'won').length;
    const completedTasks = storage.tasks.filter((t) => t.assignedTo === u.id && t.status === 'done').length;

    return {
      id: u.id,
      name: u.name,
      role: u.role,
      assignedLeadsCount: assignedLeads.length,
      dealsWon: wonCount,
      revenueGenerated: assignedLeads.filter((l) => l.status === 'won').reduce((s, l) => s + l.value, 0),
      tasksCompleted: completedTasks,
    };
  });

  return NextResponse.json({
    metrics: {
      totalLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      totalPipelineValue,
      activeTasks: storage.tasks.filter((t) => t.status !== 'done').length,
    },
    funnelStages,
    sourceData,
    productData,
    teamPerformance,
  });
}
