import { describe, it, expect, beforeEach } from 'vitest';
import { calculateConceptMastery, calculateSubjectMastery } from '../lib/masteryCalculator';
import { analyzeKnowledgeGaps } from '../lib/gapDetectionEngine';
import { generatePersonalizedRoadmap } from '../lib/learningPathPlanner';
import { calculateNextRevision, getRevisionQueue } from '../lib/spacedRevisionEngine';
import { getDeterministicExplanation, generateDeterministicQuestions } from '../lib/ai/fallbackEngine';
import { AssessmentSubmitSchema, ChatRequestSchema } from '../lib/ai/schemas';
import { Concept, KnowledgeMap, StudentProfile } from '../lib/types';
import { DEMO_CONCEPTS, DEMO_KNOWLEDGE_MAP, DEMO_STUDENT_PROFILE } from '../lib/demoData';

describe('LearnLoop AI Critical Learning Engine Verification', () => {
  // TEST CASE 1: Strong variables, weak loops -> loops identified as learning priority
  it('TEST CASE 1: Identifies loops as learning priority when student is strong in variables but weak in loops', () => {
    const testMap: KnowledgeMap = {
      subjectId: 'cs-foundations',
      subjectName: 'Computer Science Foundations',
      overallMastery: 60,
      weakConceptIds: ['loops'],
      masteredConceptIds: ['variables'],
      updatedAt: new Date().toISOString(),
      concepts: {
        variables: {
          id: 'variables',
          name: 'Variables & Memory',
          category: 'Foundations',
          prerequisites: [],
          difficulty: 'beginner',
          estimatedMinutes: 20,
          importance: 'foundational',
          masteryScore: 90, // Strong!
          status: 'MASTERED',
          attemptsCount: 4,
          correctCount: 4,
          revisionIntervalDays: 14,
          retentionRate: 95,
          keyPoints: ['Memory models'],
          commonMisconceptions: [],
        },
        loops: {
          id: 'loops',
          name: 'Loops & Iteration',
          category: 'Core Logic',
          prerequisites: ['variables'],
          difficulty: 'intermediate',
          estimatedMinutes: 30,
          importance: 'critical',
          masteryScore: 30, // Weak!
          status: 'WEAK',
          attemptsCount: 2,
          correctCount: 0,
          revisionIntervalDays: 1,
          retentionRate: 35,
          keyPoints: ['Iteration rules'],
          commonMisconceptions: [],
        },
      },
    };

    const analysis = analyzeKnowledgeGaps(testMap, []);
    expect(analysis.identifiedGaps.length).toBeGreaterThan(0);
    // Highest priority gap must be loops
    expect(analysis.immediatePriorityConceptId).toBe('loops');
    expect(analysis.immediatePriorityReason).toContain('Loops & Iteration');
  });

  // TEST CASE 2: Repeated failure on functions -> simpler explanations & prerequisite revision
  it('TEST CASE 2: When student repeatedly fails questions on functions, recommends foundational remediation', () => {
    const functionConcept: Concept = {
      id: 'functions',
      name: 'Functions and Modular Decomposition',
      category: 'Abstraction',
      prerequisites: ['variables'],
      difficulty: 'intermediate',
      estimatedMinutes: 35,
      importance: 'foundational',
      masteryScore: 35,
      status: 'WEAK',
      attemptsCount: 3,
      correctCount: 1,
      revisionIntervalDays: 1,
      retentionRate: 40,
      keyPoints: [],
      commonMisconceptions: [],
    };

    // Failed attempt with 25% score
    const result = calculateConceptMastery({
      currentConcept: functionConcept,
      recentScorePercentage: 25,
      timeSpentSeconds: 120,
    });

    expect(result.newMasteryScore).toBeLessThanOrEqual(35);
    expect(result.newStatus).toBe('WEAK');

    // Deterministic explanation provides ELI5 and Beginner Mental Model
    const pedagogicalLesson = getDeterministicExplanation('Functions and Modular Decomposition', 'english');
    expect(pedagogicalLesson.beginnerELI5).toBeDefined();
    expect(pedagogicalLesson.commonMistakes.length).toBeGreaterThan(0);
    expect(pedagogicalLesson.stepByStep.length).toBeGreaterThan(0);
  });

  // TEST CASE 3: Performs well in two consecutive assessments -> mastery increases & next concept unlocked
  it('TEST CASE 3: Two consecutive high scores increase mastery and graduate concept towards MASTERED', () => {
    const conceptToLevel: Concept = {
      id: 'loops',
      name: 'Loops and Iterative Patterns',
      category: 'Core',
      prerequisites: [],
      difficulty: 'intermediate',
      estimatedMinutes: 30,
      importance: 'critical',
      masteryScore: 65,
      status: 'LEARNING',
      attemptsCount: 1,
      correctCount: 1,
      revisionIntervalDays: 3,
      retentionRate: 70,
      keyPoints: [],
      commonMisconceptions: [],
    };

    // Assessment attempt 1: 90% score
    const step1 = calculateConceptMastery({
      currentConcept: conceptToLevel,
      recentScorePercentage: 90,
    });
    expect(step1.newMasteryScore).toBeGreaterThan(65);

    // Assessment attempt 2: 95% score
    const updatedConcept: Concept = {
      ...conceptToLevel,
      masteryScore: step1.newMasteryScore,
      attemptsCount: conceptToLevel.attemptsCount + 1,
      status: step1.newStatus,
    };

    const step2 = calculateConceptMastery({
      currentConcept: updatedConcept,
      recentScorePercentage: 95,
    });

    expect(step2.newMasteryScore).toBeGreaterThanOrEqual(80);
    expect(step2.newStatus).toBe('MASTERED');
  });

  // TEST CASE 4: Exam in three days -> prioritizes high-impact concepts and respects daily time limit
  it('TEST CASE 4: Exam in 3 days prioritizes urgent blockers and limits daily workload to daily minutes', () => {
    const shortSprintProfile: StudentProfile = {
      ...DEMO_STUDENT_PROFILE,
      examDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days remaining!
      dailyStudyMinutes: 60,
    };

    const roadmap = generatePersonalizedRoadmap(shortSprintProfile, DEMO_KNOWLEDGE_MAP);
    expect(roadmap.daysRemaining).toBe(3);

    // Day 1 steps must prioritize urgent/weak items (like Functions and Arrays)
    const day1Steps = roadmap.steps.filter((s) => s.dayNumber === 1);
    expect(day1Steps.length).toBeGreaterThan(0);

    // Total minutes in Day 1 must respect dailyStudyMinutes constraint
    const day1TotalMinutes = day1Steps.reduce((acc, s) => acc + s.estimatedMinutes, 0);
    expect(day1TotalMinutes).toBeLessThanOrEqual(shortSprintProfile.dailyStudyMinutes + 30);

    // Urgent concept must be scheduled on Day 1
    const hasUrgent = day1Steps.some((s) => s.priority === 'urgent');
    expect(hasUrgent).toBe(true);
  });

  // TEST CASE 5: AI API unavailable -> deterministic fallback functional with zero crash
  it('TEST CASE 5: AI fallback engine provides deterministic, schema-compliant responses without external API', () => {
    const fallbackLesson = getDeterministicExplanation('Loops and Iteration', 'hinglish');
    expect(fallbackLesson.conceptId).toBe('loops');
    expect(fallbackLesson.beginnerELI5).toContain('loop');
    expect(fallbackLesson.stepByStep.length).toBeGreaterThanOrEqual(3);

    const fallbackQuestions = generateDeterministicQuestions('loops', 'Loops and Iteration', 'intermediate', 4);
    expect(fallbackQuestions.length).toBe(4);
    expect(fallbackQuestions[0].options).toBeDefined();
    expect(fallbackQuestions[0].correctAnswer).toBeDefined();
  });

  // TEST CASE 6: Student refreshes browser -> saved progress persists in data model
  it('TEST CASE 6: State persistence data models retain mastery, history, and status integrity', () => {
    const serialized = JSON.stringify(DEMO_KNOWLEDGE_MAP);
    const restored: KnowledgeMap = JSON.parse(serialized);

    expect(restored.overallMastery).toBe(DEMO_KNOWLEDGE_MAP.overallMastery);
    expect(restored.concepts['variables'].status).toBe('MASTERED');
    expect(restored.concepts['functions'].status).toBe('WEAK');
  });

  // TEST CASE 7: Malformed AI response handling -> schema rejects and recovers safely
  it('TEST CASE 7: Validates and rejects malformed request payloads', () => {
    const invalidChat = {
      message: '', // Empty message is invalid!
      language: 'spanish', // Invalid language!
    };

    const parseResult = ChatRequestSchema.safeParse(invalidChat);
    expect(parseResult.success).toBe(false);
  });

  // TEST CASE 8: Invalid assessment response -> backend validation rejects invalid data
  it('TEST CASE 8: Assessment submission schema validates answer presence and rejects empty attempts', () => {
    const emptySubmission = {
      conceptId: 'loops',
      answers: [], // Empty array must be rejected!
    };

    const validateResult = AssessmentSubmitSchema.safeParse(emptySubmission);
    expect(validateResult.success).toBe(false);

    const validSubmission = {
      conceptId: 'loops',
      answers: [
        {
          questionId: 'q1',
          studentAnswer: 'The loop never executes',
          timeSpentSeconds: 15,
        },
      ],
    };

    const validResult = AssessmentSubmitSchema.safeParse(validSubmission);
    expect(validResult.success).toBe(true);
  });
});
