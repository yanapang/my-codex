/**
 * Agent role definitions for oh-my-codex
 * Each agent has a name, description, default model tier, and tool access pattern.
 * Prompt content is loaded from the prompts/ directory at runtime.
 */

export interface AgentDefinition {
  name: string;
  description: string;
  model: 'haiku' | 'sonnet' | 'opus';
  posture: 'frontier-orchestrator' | 'deep-worker' | 'fast-lane';
  modelClass: 'frontier' | 'standard' | 'fast';
  routingRole: 'leader' | 'specialist' | 'executor';
  /** Tool access pattern */
  tools: 'read-only' | 'analysis' | 'execution' | 'data';
  /** Category for grouping */
  category: 'build' | 'review' | 'domain' | 'product' | 'coordination';
}

const EXECUTOR_AGENT: AgentDefinition = {
  name: 'executor',
  description: 'Code implementation, refactoring, feature work',
  model: 'sonnet',
  posture: 'deep-worker',
  modelClass: 'standard',
  routingRole: 'executor',
  tools: 'execution',
  category: 'build',
};

export const AGENT_DEFINITIONS: Record<string, AgentDefinition> = {
  // Build/Analysis Lane
  'explore': {
    name: 'explore',
    description: 'Fast codebase search and file/symbol mapping',
    model: 'haiku',
    posture: 'fast-lane',
    modelClass: 'fast',
    routingRole: 'specialist',
    tools: 'read-only',
    category: 'build',
  },
  'analyst': {
    name: 'analyst',
    description: 'Requirements clarity, acceptance criteria, hidden constraints',
    model: 'opus',
    posture: 'frontier-orchestrator',
    modelClass: 'frontier',
    routingRole: 'leader',
    tools: 'analysis',
    category: 'build',
  },
  'planner': {
    name: 'planner',
    description: 'Task sequencing, execution plans, risk flags',
    model: 'opus',
    posture: 'frontier-orchestrator',
    modelClass: 'frontier',
    routingRole: 'leader',
    tools: 'analysis',
    category: 'build',
  },
  'architect': {
    name: 'architect',
    description: 'System design, boundaries, interfaces, long-horizon tradeoffs',
    model: 'opus',
    posture: 'frontier-orchestrator',
    modelClass: 'frontier',
    routingRole: 'leader',
    tools: 'read-only',
    category: 'build',
  },
  'debugger': {
    name: 'debugger',
    description: 'Root-cause analysis, regression isolation, failure diagnosis',
    model: 'sonnet',
    posture: 'deep-worker',
    modelClass: 'standard',
    routingRole: 'executor',
    tools: 'analysis',
    category: 'build',
  },
  'executor': EXECUTOR_AGENT,
  'verifier': {
    name: 'verifier',
    description: 'Completion evidence, claim validation, test adequacy',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'leader',
    tools: 'analysis',
    category: 'build',
  },

  // Review Lane
  'style-reviewer': {
    name: 'style-reviewer',
    description: 'Formatting, naming, idioms, lint conventions',
    model: 'haiku',
    posture: 'fast-lane',
    modelClass: 'fast',
    routingRole: 'specialist',
    tools: 'read-only',
    category: 'review',
  },
  'quality-reviewer': {
    name: 'quality-reviewer',
    description: 'Logic defects, maintainability, anti-patterns',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'leader',
    tools: 'read-only',
    category: 'review',
  },
  'api-reviewer': {
    name: 'api-reviewer',
    description: 'API contracts, versioning, backward compatibility',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'leader',
    tools: 'read-only',
    category: 'review',
  },
  'security-reviewer': {
    name: 'security-reviewer',
    description: 'Vulnerabilities, trust boundaries, authn/authz',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'leader',
    tools: 'read-only',
    category: 'review',
  },
  'performance-reviewer': {
    name: 'performance-reviewer',
    description: 'Hotspots, complexity, memory/latency optimization',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'leader',
    tools: 'read-only',
    category: 'review',
  },
  'code-reviewer': {
    name: 'code-reviewer',
    description: 'Comprehensive review across all concerns',
    model: 'opus',
    posture: 'frontier-orchestrator',
    modelClass: 'frontier',
    routingRole: 'leader',
    tools: 'read-only',
    category: 'review',
  },

  // Domain Specialists
  'dependency-expert': {
    name: 'dependency-expert',
    description: 'External SDK/API/package evaluation',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'specialist',
    tools: 'analysis',
    category: 'domain',
  },
  'test-engineer': {
    name: 'test-engineer',
    description: 'Test strategy, coverage, flaky-test hardening',
    model: 'sonnet',
    posture: 'deep-worker',
    modelClass: 'standard',
    routingRole: 'executor',
    tools: 'execution',
    category: 'domain',
  },
  'quality-strategist': {
    name: 'quality-strategist',
    description: 'Quality strategy, release readiness, risk assessment',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'leader',
    tools: 'analysis',
    category: 'domain',
  },
  'build-fixer': {
    name: 'build-fixer',
    description: 'Build/toolchain/type failures resolution',
    model: 'sonnet',
    posture: 'deep-worker',
    modelClass: 'standard',
    routingRole: 'executor',
    tools: 'execution',
    category: 'domain',
  },
  'designer': {
    name: 'designer',
    description: 'UX/UI architecture, interaction design',
    model: 'sonnet',
    posture: 'deep-worker',
    modelClass: 'standard',
    routingRole: 'executor',
    tools: 'execution',
    category: 'domain',
  },
  'writer': {
    name: 'writer',
    description: 'Documentation, migration notes, user guidance',
    model: 'haiku',
    posture: 'fast-lane',
    modelClass: 'fast',
    routingRole: 'specialist',
    tools: 'execution',
    category: 'domain',
  },
  'qa-tester': {
    name: 'qa-tester',
    description: 'Interactive CLI/service runtime validation',
    model: 'sonnet',
    posture: 'deep-worker',
    modelClass: 'standard',
    routingRole: 'executor',
    tools: 'execution',
    category: 'domain',
  },
  'git-master': {
    name: 'git-master',
    description: 'Commit strategy, history hygiene, rebasing',
    model: 'sonnet',
    posture: 'deep-worker',
    modelClass: 'standard',
    routingRole: 'executor',
    tools: 'execution',
    category: 'domain',
  },
  'code-simplifier': {
    name: 'code-simplifier',
    description: 'Simplifies recently modified code for clarity and consistency without changing behavior',
    model: 'opus',
    posture: 'deep-worker',
    modelClass: 'frontier',
    routingRole: 'executor',
    tools: 'execution',
    category: 'domain',
  },
  'researcher': {
    name: 'researcher',
    description: 'External documentation and reference research',
    model: 'sonnet',
    posture: 'fast-lane',
    modelClass: 'standard',
    routingRole: 'specialist',
    tools: 'analysis',
    category: 'domain',
  },

  // Product Lane
  'product-manager': {
    name: 'product-manager',
    description: 'Problem framing, personas/JTBD, PRDs',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'leader',
    tools: 'analysis',
    category: 'product',
  },
  'ux-researcher': {
    name: 'ux-researcher',
    description: 'Heuristic audits, usability, accessibility',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'specialist',
    tools: 'analysis',
    category: 'product',
  },
  'information-architect': {
    name: 'information-architect',
    description: 'Taxonomy, navigation, findability',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'specialist',
    tools: 'analysis',
    category: 'product',
  },
  'product-analyst': {
    name: 'product-analyst',
    description: 'Product metrics, funnel analysis, experiments',
    model: 'sonnet',
    posture: 'frontier-orchestrator',
    modelClass: 'standard',
    routingRole: 'specialist',
    tools: 'analysis',
    category: 'product',
  },

  // Coordination
  'critic': {
    name: 'critic',
    description: 'Plan/design critical challenge and review',
    model: 'opus',
    posture: 'frontier-orchestrator',
    modelClass: 'frontier',
    routingRole: 'leader',
    tools: 'read-only',
    category: 'coordination',
  },
  'vision': {
    name: 'vision',
    description: 'Image/screenshot/diagram analysis',
    model: 'sonnet',
    posture: 'fast-lane',
    modelClass: 'standard',
    routingRole: 'specialist',
    tools: 'read-only',
    category: 'coordination',
  },
};

/** Get agent definition by name */
export function getAgent(name: string): AgentDefinition | undefined {
  return AGENT_DEFINITIONS[name];
}

/** Get all agents in a category */
export function getAgentsByCategory(category: AgentDefinition['category']): AgentDefinition[] {
  return Object.values(AGENT_DEFINITIONS).filter(a => a.category === category);
}

/** Get all agent names */
export function getAgentNames(): string[] {
  return Object.keys(AGENT_DEFINITIONS);
}
