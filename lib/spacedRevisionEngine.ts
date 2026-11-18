import { Concept, RevisionItem } from './types';

const INTERVAL_SCHEDULE_DAYS = [1, 3, 7, 14, 30, 60];

export interface RevisionScheduleUpdate {
  nextIntervalDays: number;
  nextDueDate: string;
  newRepetitionCount: number;
  status: 'due_today' | 'upcoming' | 'overdue' | 'completed';
}

/**
 * Calculates spaced repetition interval using modified SM-2 algorithm.
 */
export function calculateNextRevision(
  currentRepetition: number,
  scorePercentage: number
): RevisionScheduleUpdate {
  const now = new Date();

  if (scorePercentage < 60) {
    // Retention failure: reset interval to 1 day
    const nextDueDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
    return {
      nextIntervalDays: 1,
      nextDueDate,
      newRepetitionCount: 0,
      status: 'due_today',
    };
  }

  // Retention success: graduate to next spaced interval
  const nextRepetition = currentRepetition + 1;
  const intervalIndex = Math.min(nextRepetition, INTERVAL_SCHEDULE_DAYS.length - 1);
  const nextIntervalDays = INTERVAL_SCHEDULE_DAYS[intervalIndex];

  const nextDueDate = new Date(now.getTime() + nextIntervalDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    nextIntervalDays,
    nextDueDate,
    newRepetitionCount: nextRepetition,
    status: 'upcoming',
  };
}

/**
 * Generates actionable revision queue from concepts.
 */
export function getRevisionQueue(concepts: Record<string, Concept>): {
  dueToday: RevisionItem[];
  overdue: RevisionItem[];
  upcoming: RevisionItem[];
  completedCount: number;
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const dueToday: RevisionItem[] = [];
  const overdue: RevisionItem[] = [];
  const upcoming: RevisionItem[] = [];
  let completedCount = 0;

  for (const c of Object.values(concepts)) {
    if (!c.nextRevisionAt) {
      if (c.status === 'REVISION_REQUIRED') {
        dueToday.push({
          id: `rev-${c.id}`,
          conceptId: c.id,
          conceptName: c.name,
          dueDate: new Date().toISOString(),
          status: 'due_today',
          repetitionCount: 0,
          intervalDays: 1,
          lastMasteryScore: c.masteryScore,
          nextIntervalDays: 1,
        });
      }
      continue;
    }

    const dueDate = new Date(c.nextRevisionAt).getTime();

    if (dueDate < todayStart) {
      overdue.push({
        id: `rev-${c.id}`,
        conceptId: c.id,
        conceptName: c.name,
        dueDate: c.nextRevisionAt,
        status: 'overdue',
        repetitionCount: Math.max(1, Math.round(c.revisionIntervalDays / 3)),
        intervalDays: c.revisionIntervalDays,
        lastMasteryScore: c.masteryScore,
        nextIntervalDays: c.revisionIntervalDays,
      });
    } else if (dueDate >= todayStart && dueDate <= todayEnd) {
      dueToday.push({
        id: `rev-${c.id}`,
        conceptId: c.id,
        conceptName: c.name,
        dueDate: c.nextRevisionAt,
        status: 'due_today',
        repetitionCount: Math.max(1, Math.round(c.revisionIntervalDays / 3)),
        intervalDays: c.revisionIntervalDays,
        lastMasteryScore: c.masteryScore,
        nextIntervalDays: c.revisionIntervalDays,
      });
    } else {
      upcoming.push({
        id: `rev-${c.id}`,
        conceptId: c.id,
        conceptName: c.name,
        dueDate: c.nextRevisionAt,
        status: 'upcoming',
        repetitionCount: Math.max(1, Math.round(c.revisionIntervalDays / 3)),
        intervalDays: c.revisionIntervalDays,
        lastMasteryScore: c.masteryScore,
        nextIntervalDays: c.revisionIntervalDays,
      });
    }

    if (c.status === 'MASTERED' && dueDate > todayEnd) {
      completedCount++;
    }
  }

  return { dueToday, overdue, upcoming, completedCount };
}
