import { Concept, KnowledgeMap, QuestionAttempt } from './types';

export interface IdentifiedGap {
  conceptId: string;
  conceptName: string;
  severity: 'critical' | 'moderate' | 'mild';
  gapType: 'foundational_prerequisite' | 'conceptual_misunderstanding' | 'procedural_mistake' | 'untested';
  prerequisiteOf?: string[];
  recommendedAction: string;
  priorityOrder: number; // 1 = highest priority
}

export interface GapAnalysisReport {
  subjectName: string;
  overallMastery: number;
  identifiedGaps: IdentifiedGap[];
  rootFoundationalBlocker?: IdentifiedGap;
  immediatePriorityConceptId: string;
  immediatePriorityReason: string;
  conceptualVsProceduralBreakdown: {
    conceptualCount: number;
    proceduralCount: number;
    carelessCount: number;
  };
}

/**
 * AI Knowledge Gap Detection Engine
 * Discovers root gaps, missing prerequisites, and distinguishes conceptual vs procedural mistakes.
 */
export function analyzeKnowledgeGaps(
  knowledgeMap: KnowledgeMap,
  recentAttempts: QuestionAttempt[] = []
): GapAnalysisReport {
  const concepts = knowledgeMap.concepts;
  const gaps: IdentifiedGap[] = [];

  // Count error types from recent attempts
  let conceptualCount = 0;
  let proceduralCount = 0;
  let carelessCount = 0;

  for (const att of recentAttempts) {
    if (!att.isCorrect) {
      if (att.errorType === 'conceptual') conceptualCount++;
      else if (att.errorType === 'procedural') proceduralCount++;
      else carelessCount++;
    }
  }

  // Find all concepts that are prerequisites for other concepts
  const prerequisiteUsage: Record<string, string[]> = {};
  for (const c of Object.values(concepts)) {
    for (const prereqId of c.prerequisites) {
      if (!prerequisiteUsage[prereqId]) {
        prerequisiteUsage[prereqId] = [];
      }
      prerequisiteUsage[prereqId].push(c.name);
    }
  }

  // 1. Identify weak or failing concepts
  for (const c of Object.values(concepts)) {
    const isWeak = c.status === 'WEAK' || c.masteryScore < 40;
    const isRevision = c.status === 'REVISION_REQUIRED';
    const isUnassessed = c.status === 'UNASSESSED';

    if (isWeak || isRevision || isUnassessed) {
      const dependents = prerequisiteUsage[c.id] || [];
      const isPrerequisite = dependents.length > 0;

      let gapType: IdentifiedGap['gapType'] = 'conceptual_misunderstanding';
      let severity: IdentifiedGap['severity'] = 'moderate';

      if (isPrerequisite && isWeak) {
        gapType = 'foundational_prerequisite';
        severity = 'critical';
      } else if (isWeak && c.importance === 'foundational') {
        gapType = 'foundational_prerequisite';
        severity = 'critical';
      } else if (isRevision) {
        severity = 'moderate';
      } else if (isUnassessed) {
        gapType = 'untested';
        severity = isPrerequisite ? 'moderate' : 'mild';
      }

      // Action advice
      let action = '';
      if (gapType === 'foundational_prerequisite') {
        action = `Critical foundational blocker: Master ${c.name} first before proceeding to ${dependents.slice(0, 2).join(', ')}.`;
      } else if (isWeak) {
        action = `Review foundational rules and worked examples for ${c.name}.`;
      } else if (isRevision) {
        action = `Retention decayed. Complete quick spaced revision check.`;
      } else {
        action = `Take diagnostic assessment to baseline capability.`;
      }

      // Priority ordering: critical foundational = 1-10, weak = 11-20, revision = 21-30, unassessed = 31+
      let priorityOrder = 50;
      if (gapType === 'foundational_prerequisite') {
        priorityOrder = 1;
      } else if (severity === 'critical') {
        priorityOrder = 5;
      } else if (c.status === 'WEAK') {
        priorityOrder = 10;
      } else if (isRevision) {
        priorityOrder = 20;
      } else if (isUnassessed && isPrerequisite) {
        priorityOrder = 30;
      }

      gaps.push({
        conceptId: c.id,
        conceptName: c.name,
        severity,
        gapType,
        prerequisiteOf: dependents,
        recommendedAction: action,
        priorityOrder,
      });
    }
  }

  // Sort gaps by priority order ascending (lowest number = highest urgency)
  gaps.sort((a, b) => a.priorityOrder - b.priorityOrder);

  // Identify root foundational blocker
  const rootBlocker = gaps.find((g) => g.gapType === 'foundational_prerequisite') || gaps[0];

  const immediatePriorityConceptId = rootBlocker ? rootBlocker.conceptId : Object.keys(concepts)[0] || '';
  const immediatePriorityReason = rootBlocker
    ? rootBlocker.recommendedAction
    : 'All current concepts have healthy mastery scores. Ready for advanced practice.';

  return {
    subjectName: knowledgeMap.subjectName,
    overallMastery: knowledgeMap.overallMastery,
    identifiedGaps: gaps,
    rootFoundationalBlocker: rootBlocker,
    immediatePriorityConceptId,
    immediatePriorityReason,
    conceptualVsProceduralBreakdown: {
      conceptualCount,
      proceduralCount,
      carelessCount,
    },
  };
}
