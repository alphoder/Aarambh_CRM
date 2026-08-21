// Intelligent Model Router: Chooses SLM (Flash Lite) vs LLM (Flash) based on query complexity

export interface RoutingDecision {
  model: string;
  isLLM: boolean;
  reason: string;
  complexityScore: number; // 1 to 10
}

export function routeAIQuery(query: string): RoutingDecision {
  const q = query.toLowerCase().trim();

  // Keyword markers that signal complex multi-dimensional reasoning
  const complexIndicators = [
    'analyze',
    'analysis',
    'compare',
    'trend',
    'forecast',
    'predict',
    'recommend',
    'strategy',
    'why',
    'explain',
    'synthesize',
    'conversion rate',
    'profit and loss',
    'p&l',
    'revenue projection',
    'performance report',
  ];

  // Simple markers (list, filter, count, lookup)
  const simpleIndicators = [
    'list',
    'show',
    'how many',
    'count',
    'who',
    'phone number',
    'email',
    'status of',
    'find',
    'search',
    'tell me about',
  ];

  let complexity = 3; // base

  // Length factor
  if (q.length > 120) complexity += 2;
  if (q.length > 250) complexity += 2;

  // Complexity indicators check
  for (const ind of complexIndicators) {
    if (q.includes(ind)) {
      complexity += 3;
      break;
    }
  }

  // Simple indicators check
  for (const ind of simpleIndicators) {
    if (q.includes(ind)) {
      complexity -= 1;
    }
  }

  complexity = Math.max(1, Math.min(10, complexity));

  const slmModel = process.env.GEMINI_MODEL_SLM || 'gemini-2.0-flash-lite';
  const llmModel = process.env.GEMINI_MODEL_LLM || 'gemini-2.5-flash';

  if (complexity >= 6) {
    return {
      model: llmModel,
      isLLM: true,
      reason: 'Complex analytical query requiring multi-step reasoning, forecasting, or synthesis.',
      complexityScore: complexity,
    };
  } else {
    return {
      model: slmModel,
      isLLM: false,
      reason: 'Standard informational lookup, list query, or single-entity retrieval (Optimized for speed & efficiency).',
      complexityScore: complexity,
    };
  }
}
