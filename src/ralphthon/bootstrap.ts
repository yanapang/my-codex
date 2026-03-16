import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { readPlanningArtifacts } from '../planning/artifacts.js';
import { createRalphthonPrd, type RalphthonPrd, type RalphthonStory } from './prd.js';

function extractSection(markdown: string, heading: string): string[] {
  const pattern = new RegExp(`^##\\s+${heading}\\s*$`, 'im');
  const match = pattern.exec(markdown);
  if (!match || match.index < 0) return [];
  const start = match.index + match[0].length;
  const remainder = markdown.slice(start);
  const nextHeading = remainder.search(/^##\s+/m);
  const section = nextHeading >= 0 ? remainder.slice(0, nextHeading) : remainder;
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
    .filter(Boolean);
}

function extractTitle(markdown: string, fallback: string): string {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  return titleMatch?.[1]?.trim() || fallback;
}

function extractNarrative(markdown: string, heading: string): string | null {
  const pattern = new RegExp(`^##\\s+${heading}\\s*$`, 'im');
  const match = pattern.exec(markdown);
  if (!match || match.index < 0) return null;
  const start = match.index + match[0].length;
  const remainder = markdown.slice(start);
  const nextHeading = remainder.search(/^##\s+/m);
  const section = (nextHeading >= 0 ? remainder.slice(0, nextHeading) : remainder)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .trim();
  return section || null;
}

function buildStoryFromSpec(markdown: string, fallbackProject: string): RalphthonStory {
  const title = extractTitle(markdown, fallbackProject);
  const acceptanceCriteria = extractSection(markdown, 'Testable acceptance criteria');
  const inScope = extractSection(markdown, 'In-Scope');
  const desiredOutcome = extractNarrative(markdown, 'Desired Outcome');

  const taskDescriptions = acceptanceCriteria.length > 0
    ? acceptanceCriteria
    : inScope.length > 0
      ? inScope
      : [desiredOutcome || title];

  return {
    id: 'S1',
    title,
    status: 'pending',
    tasks: taskDescriptions.map((desc, index) => ({
      id: `T${index + 1}`,
      desc,
      status: 'pending',
      retries: 0,
    })),
  };
}

export async function bootstrapRalphthonPrdFromExistingArtifacts(cwd: string, fallbackProject: string): Promise<RalphthonPrd | null> {
  const artifacts = readPlanningArtifacts(cwd);
  const deepInterviewSpecPath = artifacts.deepInterviewSpecPaths.at(-1);
  if (deepInterviewSpecPath && existsSync(deepInterviewSpecPath)) {
    const content = await readFile(deepInterviewSpecPath, 'utf-8');
    return createRalphthonPrd({
      project: extractTitle(content, fallbackProject),
      stories: [buildStoryFromSpec(content, fallbackProject)],
    });
  }

  const canonicalPrdPath = artifacts.prdPaths.at(-1);
  if (canonicalPrdPath && existsSync(canonicalPrdPath)) {
    const content = await readFile(canonicalPrdPath, 'utf-8');
    return createRalphthonPrd({
      project: extractTitle(content, basename(canonicalPrdPath)),
      stories: [buildStoryFromSpec(content, fallbackProject)],
    });
  }

  return null;
}
