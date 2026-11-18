'use client';

import {
  AssessmentResult,
  Concept,
  KnowledgeMap,
  PersonalizedRoadmap,
  RevisionItem,
  StudentProfile,
} from './types';
import {
  DEMO_ASSESSMENT_HISTORY,
  DEMO_KNOWLEDGE_MAP,
  DEMO_STUDENT_PROFILE,
} from './demoData';
import { calculateConceptMastery, calculateSubjectMastery } from './masteryCalculator';
import { generatePersonalizedRoadmap } from './learningPathPlanner';
import { getRevisionQueue, calculateNextRevision } from './spacedRevisionEngine';

const STORAGE_KEYS = {
  PROFILE: 'learnloop_profile_v1',
  KNOWLEDGE_MAP: 'learnloop_kmap_v1',
  ROADMAP: 'learnloop_roadmap_v1',
  ASSESSMENTS: 'learnloop_assessments_v1',
  IS_DEMO: 'learnloop_is_demo_v1',
  CUSTOM_API_KEY: 'learnloop_gemini_key_v1',
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Store listener error:', e);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// In-memory cache for fast SSR / hydration sync
let currentProfile: StudentProfile = DEMO_STUDENT_PROFILE;
let currentKnowledgeMap: KnowledgeMap = DEMO_KNOWLEDGE_MAP;
let currentRoadmap: PersonalizedRoadmap = generatePersonalizedRoadmap(
  DEMO_STUDENT_PROFILE,
  DEMO_KNOWLEDGE_MAP
);
let currentAssessments: AssessmentResult[] = DEMO_ASSESSMENT_HISTORY;
let isInitialized = false;

export function initStore() {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  try {
    const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const savedKMap = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_MAP);
    const savedAssessments = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);

    if (savedProfile) {
      currentProfile = JSON.parse(savedProfile);
    } else {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEMO_STUDENT_PROFILE));
    }

    if (savedKMap) {
      currentKnowledgeMap = JSON.parse(savedKMap);
    } else {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_MAP, JSON.stringify(DEMO_KNOWLEDGE_MAP));
    }

    if (savedAssessments) {
      currentAssessments = JSON.parse(savedAssessments);
    } else {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(DEMO_ASSESSMENT_HISTORY));
    }

    currentRoadmap = generatePersonalizedRoadmap(currentProfile, currentKnowledgeMap);
    isInitialized = true;
    notify();
  } catch (err) {
    console.warn('Storage initialization fallback to default demo data:', err);
    isInitialized = true;
  }
}

export function getProfile(): StudentProfile {
  if (!isInitialized && typeof window !== 'undefined') initStore();
  return currentProfile;
}

export function saveProfile(newProfile: Partial<StudentProfile>) {
  currentProfile = {
    ...currentProfile,
    ...newProfile,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentProfile));
  }

  // Recalculate roadmap whenever profile or exam date changes
  currentRoadmap = generatePersonalizedRoadmap(currentProfile, currentKnowledgeMap);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(currentRoadmap));
  }

  notify();
}

export function getKnowledgeMap(): KnowledgeMap {
  if (!isInitialized && typeof window !== 'undefined') initStore();
  return currentKnowledgeMap;
}

export function getRoadmap(): PersonalizedRoadmap {
  if (!isInitialized && typeof window !== 'undefined') initStore();
  return currentRoadmap;
}

export function getAssessments(): AssessmentResult[] {
  if (!isInitialized && typeof window !== 'undefined') initStore();
  return currentAssessments;
}

export function recordAssessment(result: AssessmentResult) {
  // 1. Update concept in KnowledgeMap
  const concept = currentKnowledgeMap.concepts[result.conceptId];
  if (concept) {
    const calc = calculateConceptMastery({
      currentConcept: concept,
      recentScorePercentage: result.scorePercentage,
      timeSpentSeconds: result.timeSpentSeconds,
    });

    const repCount = Math.max(0, concept.attemptsCount);
    const rev = calculateNextRevision(repCount, result.scorePercentage);

    const updatedConcept: Concept = {
      ...concept,
      masteryScore: calc.newMasteryScore,
      status: calc.newStatus,
      attemptsCount: concept.attemptsCount + 1,
      correctCount: concept.correctCount + (result.scorePercentage >= 70 ? 1 : 0),
      lastAssessedAt: new Date().toISOString(),
      nextRevisionAt: rev.nextDueDate,
      revisionIntervalDays: rev.nextIntervalDays,
    };

    const newConcepts = {
      ...currentKnowledgeMap.concepts,
      [result.conceptId]: updatedConcept,
    };

    const newOverallMastery = calculateSubjectMastery(newConcepts);
    const weakConceptIds = Object.values(newConcepts)
      .filter((c) => c.status === 'WEAK' || c.masteryScore < 40)
      .map((c) => c.id);
    const masteredConceptIds = Object.values(newConcepts)
      .filter((c) => c.status === 'MASTERED')
      .map((c) => c.id);

    currentKnowledgeMap = {
      ...currentKnowledgeMap,
      concepts: newConcepts,
      overallMastery: newOverallMastery,
      weakConceptIds,
      masteredConceptIds,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_MAP, JSON.stringify(currentKnowledgeMap));
    }
  }

  // 2. Add to assessment history
  currentAssessments = [result, ...currentAssessments];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(currentAssessments));
  }

  // 3. Dynamically adapt roadmap
  currentRoadmap = generatePersonalizedRoadmap(currentProfile, currentKnowledgeMap);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(currentRoadmap));
  }

  notify();
}

export function setCustomConcepts(subjectName: string, concepts: Concept[]) {
  const conceptMap: Record<string, Concept> = {};
  concepts.forEach((c) => {
    conceptMap[c.id] = c;
  });

  const overallMastery = calculateSubjectMastery(conceptMap);
  const weakConceptIds = concepts.filter((c) => c.status === 'WEAK' || c.masteryScore < 40).map((c) => c.id);
  const masteredConceptIds = concepts.filter((c) => c.status === 'MASTERED').map((c) => c.id);

  currentKnowledgeMap = {
    subjectId: subjectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    subjectName,
    concepts: conceptMap,
    overallMastery,
    weakConceptIds,
    masteredConceptIds,
    updatedAt: new Date().toISOString(),
  };

  currentProfile = {
    ...currentProfile,
    subject: subjectName,
    isDemoStudent: false,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentProfile));
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_MAP, JSON.stringify(currentKnowledgeMap));
  }

  currentRoadmap = generatePersonalizedRoadmap(currentProfile, currentKnowledgeMap);
  notify();
}

export function loadDemoExperience() {
  currentProfile = { ...DEMO_STUDENT_PROFILE };
  currentKnowledgeMap = { ...DEMO_KNOWLEDGE_MAP };
  currentAssessments = [...DEMO_ASSESSMENT_HISTORY];
  currentRoadmap = generatePersonalizedRoadmap(currentProfile, currentKnowledgeMap);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentProfile));
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_MAP, JSON.stringify(currentKnowledgeMap));
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(currentAssessments));
    localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(currentRoadmap));
  }

  notify();
}

export function resetToBlankStudent(subjectName: string = 'General Computer Science') {
  currentProfile = {
    id: `student-${Date.now()}`,
    displayName: 'New Learner',
    educationLevel: 'Undergraduate',
    degree: 'B.Tech / B.Sc',
    subject: subjectName,
    targetGoal: 'Master curriculum and prepare for exams',
    dailyStudyMinutes: 30,
    preferredLanguage: 'english',
    preferredLearningStyle: 'conceptual',
    topicConfidences: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemoStudent: false,
  };

  currentAssessments = [];

  const defaultConcepts: Concept[] = [
    {
      id: 'core-basics',
      name: `${subjectName} Fundamentals`,
      category: 'Foundations',
      prerequisites: [],
      difficulty: 'beginner',
      estimatedMinutes: 25,
      importance: 'foundational',
      masteryScore: 0,
      status: 'UNASSESSED',
      attemptsCount: 0,
      correctCount: 0,
      revisionIntervalDays: 1,
      retentionRate: 100,
      keyPoints: ['Core principles', 'Definitions', 'Initial syntax'],
      commonMisconceptions: ['Skipping foundational mental model'],
    },
    {
      id: 'intermediate-practice',
      name: `${subjectName} Core Mechanics`,
      category: 'Applied',
      prerequisites: ['core-basics'],
      difficulty: 'intermediate',
      estimatedMinutes: 35,
      importance: 'critical',
      masteryScore: 0,
      status: 'UNASSESSED',
      attemptsCount: 0,
      correctCount: 0,
      revisionIntervalDays: 1,
      retentionRate: 100,
      keyPoints: ['Standard algorithms', 'Execution flows'],
      commonMisconceptions: ['Boundary errors'],
    },
  ];

  setCustomConcepts(subjectName, defaultConcepts);
}
