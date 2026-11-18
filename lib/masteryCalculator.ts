import { Concept, ConceptStatus } from './types';

export interface MasteryUpdateParams {
  currentConcept: Concept;
  recentScorePercentage: number; // 0 to 100
  timeSpentSeconds?: number;
  isRetentionCheck?: boolean;
}

export interface MasteryCalculationResult {
  newMasteryScore: number;
  previousMasteryScore: number;
  newStatus: ConceptStatus;
  statusChanged: boolean;
  explanation: string;
}

/**
 * Transparent, weighted mastery calculator grounded exclusively in student attempts.
 * Avoids arbitrary score jumps. Requires repeated evidence for MASTERED status.
 */
export function calculateConceptMastery(params: MasteryUpdateParams): MasteryCalculationResult {
  const { currentConcept, recentScorePercentage, isRetentionCheck } = params;
  const prevScore = currentConcept.masteryScore;
  const prevAttempts = currentConcept.attemptsCount;

  // 1. Moving average weighted by attempt history
  // If first attempt, score is heavily grounded on the attempt (weight 0.75) + prior baseline
  let updatedScore: number;
  if (prevAttempts === 0) {
    updatedScore = Math.round(recentScorePercentage);
  } else {
    // Exponential smoothing: 60% historical momentum, 40% latest performance
    const alpha = 0.4;
    updatedScore = Math.round(prevScore * (1 - alpha) + recentScorePercentage * alpha);
  }

  // Cap bounds
  updatedScore = Math.max(0, Math.min(100, updatedScore));

  // Determine Concept Status
  let newStatus: ConceptStatus = currentConcept.status;
  const newAttempts = prevAttempts + 1;

  if (updatedScore < 40) {
    newStatus = 'WEAK';
  } else if (updatedScore >= 40 && updatedScore < 80) {
    newStatus = 'LEARNING';
  } else if (updatedScore >= 80) {
    // Requires at least 2 attempts or successful retention check to achieve permanent MASTERED
    if (newAttempts >= 2 || (isRetentionCheck && recentScorePercentage >= 80)) {
      newStatus = 'MASTERED';
    } else {
      newStatus = 'LEARNING'; // On track, pending consolidation
    }
  }

  // If revision was due and student passed with >= 80, clear revision required
  if (currentConcept.status === 'REVISION_REQUIRED') {
    if (recentScorePercentage >= 75) {
      newStatus = updatedScore >= 80 ? 'MASTERED' : 'LEARNING';
    } else {
      newStatus = 'WEAK';
    }
  }

  let explanation = '';
  if (updatedScore > prevScore) {
    explanation = `Mastery increased by ${updatedScore - prevScore}% (${prevScore}% → ${updatedScore}%) based on recent score of ${recentScorePercentage}%.`;
  } else if (updatedScore < prevScore) {
    explanation = `Mastery decreased by ${prevScore - updatedScore}% (${prevScore}% → ${updatedScore}%) following score of ${recentScorePercentage}%. Additional review advised.`;
  } else {
    explanation = `Mastery stable at ${updatedScore}% across ${newAttempts} assessments.`;
  }

  return {
    newMasteryScore: updatedScore,
    previousMasteryScore: prevScore,
    newStatus,
    statusChanged: newStatus !== currentConcept.status,
    explanation,
  };
}

/**
 * Calculates overall subject mastery across all concepts, weighted by concept importance.
 */
export function calculateSubjectMastery(concepts: Record<string, Concept>): number {
  const conceptList = Object.values(concepts);
  if (conceptList.length === 0) return 0;

  const weights: Record<string, number> = {
    foundational: 1.5,
    critical: 1.3,
    high: 1.0,
    medium: 0.8,
  };

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const c of conceptList) {
    const w = weights[c.importance] || 1.0;
    totalWeightedScore += c.masteryScore * w;
    totalWeight += w;
  }

  return Math.round(totalWeightedScore / totalWeight);
}
