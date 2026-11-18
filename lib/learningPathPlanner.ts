import { Concept, KnowledgeMap, PersonalizedRoadmap, RoadmapStep, StudentProfile } from './types';

export function generatePersonalizedRoadmap(
  profile: StudentProfile,
  knowledgeMap: KnowledgeMap
): PersonalizedRoadmap {
  const concepts = knowledgeMap.concepts;
  const conceptList = Object.values(concepts);

  // Calculate days remaining until exam (or default 7-day sprint)
  let daysRemaining = 7;
  if (profile.examDate) {
    const examTime = new Date(profile.examDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.ceil((examTime - nowTime) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      daysRemaining = Math.min(diffDays, 30);
    }
  }

  const dailyMinutes = profile.dailyStudyMinutes || 45;

  // Topological sorting with priority weighting:
  // 1. Weak concepts with unfulfilled dependencies come first
  // 2. Concepts that are prerequisites to other weak topics take precedence
  // 3. Exam-critical concepts get elevated if daysRemaining <= 5

  const sortedConcepts = [...conceptList].sort((a, b) => {
    // Critical rule: If A is a prerequisite of B, A must come before B
    if (b.prerequisites.includes(a.id)) return -1;
    if (a.prerequisites.includes(b.id)) return 1;

    // Next rule: WEAK concepts come before LEARNING or MASTERED
    const statusPriority: Record<string, number> = {
      WEAK: 1,
      REVISION_REQUIRED: 2,
      UNASSESSED: 3,
      LEARNING: 4,
      MASTERED: 5,
    };
    const diff = (statusPriority[a.status] || 3) - (statusPriority[b.status] || 3);
    if (diff !== 0) return diff;

    // Importance weighting (critical/foundational first)
    const importanceScore: Record<string, number> = {
      foundational: 4,
      critical: 3,
      high: 2,
      medium: 1,
    };
    return (importanceScore[b.importance] || 1) - (importanceScore[a.importance] || 1);
  });

  const steps: RoadmapStep[] = [];
  let currentDay = 1;
  let dayMinutesAccumulator = 0;

  for (let i = 0; i < sortedConcepts.length; i++) {
    const c = sortedConcepts[i];

    // Determine action type based on mastery
    let actionType: RoadmapStep['actionType'] = 'guided_practice';
    let priority: RoadmapStep['priority'] = 'medium';
    let reason = '';

    if (c.status === 'WEAK' || c.masteryScore < 40) {
      actionType = 'learn_foundational';
      priority = 'urgent';
      reason = `Mastery is low (${c.masteryScore}%). Rebuilding core mental model with beginner-friendly foundations and guided examples.`;
    } else if (c.status === 'REVISION_REQUIRED') {
      actionType = 'revision';
      priority = 'urgent';
      reason = `Retention interval reached. Quick spaced recall quiz needed to prevent concept forgetting.`;
    } else if (c.status === 'UNASSESSED') {
      actionType = 'guided_practice';
      priority = 'high';
      reason = `Initial baseline test required to measure capability.`;
    } else if (c.status === 'LEARNING') {
      actionType = 'guided_practice';
      priority = 'high';
      reason = `Current mastery is ${c.masteryScore}%. Targeted practice to push past 80% mastery threshold.`;
    } else {
      actionType = 'mastery_challenge';
      priority = 'medium';
      reason = `Concept mastered (${c.masteryScore}%). Complex scenario and exam-style problem solving.`;
    }

    // Check if prerequisites are satisfied
    const prerequisitesMet = c.prerequisites.every((prereqId) => {
      const p = concepts[prereqId];
      return p && p.masteryScore >= 60;
    });

    if (!prerequisitesMet && c.prerequisites.length > 0) {
      const missingPrereqNames = c.prerequisites
        .map((pid) => concepts[pid]?.name)
        .filter(Boolean)
        .join(', ');
      reason = `⚠️ Recommended after foundational prerequisite (${missingPrereqNames}) is strengthened.`;
    }

    // Day grouping
    const stepDuration = c.estimatedMinutes || 25;
    if (dayMinutesAccumulator + stepDuration > dailyMinutes && currentDay < daysRemaining) {
      currentDay++;
      dayMinutesAccumulator = 0;
    }
    dayMinutesAccumulator += stepDuration;

    steps.push({
      id: `step-${c.id}-${i}`,
      dayNumber: currentDay,
      conceptId: c.id,
      conceptName: c.name,
      title: `${actionType === 'learn_foundational' ? 'Foundation: ' : actionType === 'revision' ? 'Revision: ' : 'Practice: '}${c.name}`,
      estimatedMinutes: stepDuration,
      priority,
      actionType,
      completed: c.status === 'MASTERED',
      reason,
      prerequisitesMet,
    });
  }

  const totalMinutes = steps.reduce((sum, s) => sum + s.estimatedMinutes, 0);
  const completedSteps = steps.filter((s) => s.completed).length;
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  return {
    id: `roadmap-${profile.id}-${Date.now()}`,
    studentId: profile.id,
    generatedAt: new Date().toISOString(),
    examDate: profile.examDate,
    daysRemaining,
    dailyCommitmentMinutes: dailyMinutes,
    steps,
    totalMinutes,
    completionPercentage,
  };
}
