import { Concept, KnowledgeMap, StudentProfile, AssessmentResult } from './types';

export const DEMO_STUDENT_PROFILE: StudentProfile = {
  id: 'student-demo-101',
  displayName: 'Alex Sharma',
  educationLevel: 'Undergraduate',
  degree: 'B.Tech in Computer Science & Engineering',
  subject: 'Data Structures & Algorithms',
  targetGoal: 'Ace Mid-Term University Examination',
  examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now!
  dailyStudyMinutes: 45,
  preferredLanguage: 'hinglish',
  preferredLearningStyle: 'example_driven',
  topicConfidences: {
    'variables': 90,
    'control-flow': 85,
    'loops': 70,
    'functions': 35,
    'arrays': 20,
    'recursion': 15,
    'complexity': 40,
    'trees': 10,
  },
  createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  isDemoStudent: true,
};

export const DEMO_CONCEPTS: Record<string, Concept> = {
  'variables': {
    id: 'variables',
    name: 'Variables and Memory Models',
    category: 'Foundations',
    prerequisites: [],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    importance: 'foundational',
    masteryScore: 92,
    status: 'MASTERED',
    attemptsCount: 6,
    correctCount: 6,
    lastAssessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
    revisionIntervalDays: 14,
    retentionRate: 98,
    keyPoints: [
      'Primitive vs Reference types in memory',
      'Stack allocation for locals and Heap for dynamic objects',
      'Immutability and variable lifecycle'
    ],
    commonMisconceptions: [
      'Believing reassignment creates a new memory location for primitive types',
      'Confusing variable declaration with memory initialization'
    ],
  },
  'control-flow': {
    id: 'control-flow',
    name: 'Conditional Branching & Logic',
    category: 'Foundations',
    prerequisites: ['variables'],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    importance: 'foundational',
    masteryScore: 88,
    status: 'MASTERED',
    attemptsCount: 4,
    correctCount: 4,
    lastAssessedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    revisionIntervalDays: 14,
    retentionRate: 94,
    keyPoints: [
      'Boolean evaluation and truthy/falsy coercion',
      'Short-circuit evaluation in logical operators',
      'Switch-case jump tables vs cascaded if-else'
    ],
    commonMisconceptions: [
      'Assuming all conditions evaluate both sides in short-circuit operations',
      'Missing fall-through break statements in switch cases'
    ],
  },
  'loops': {
    id: 'loops',
    name: 'Loops and Iterative Patterns',
    category: 'Core Control',
    prerequisites: ['control-flow'],
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    importance: 'critical',
    masteryScore: 74,
    status: 'LEARNING',
    attemptsCount: 5,
    correctCount: 4,
    lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    revisionIntervalDays: 3,
    retentionRate: 85,
    keyPoints: [
      'Entry-controlled (for, while) vs exit-controlled (do-while)',
      'Loop invariants and termination guarantees',
      'Break, continue, and nested loop traversal'
    ],
    commonMisconceptions: [
      'Off-by-one errors with zero-indexed array boundaries',
      'Accidental infinite loops due to missing update statements'
    ],
  },
  'functions': {
    id: 'functions',
    name: 'Functions and Modular Decomposition',
    category: 'Abstraction',
    prerequisites: ['variables', 'control-flow'],
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    importance: 'foundational',
    masteryScore: 35, // WEAK!
    status: 'WEAK',
    attemptsCount: 3,
    correctCount: 1,
    lastAssessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionAt: new Date().toISOString(), // Due today!
    revisionIntervalDays: 1,
    retentionRate: 42,
    keyPoints: [
      'Parameter passing semantics: Pass by value vs pass by reference',
      'Scope, closures, and variable shadowing',
      'Pure functions and side-effect avoidance'
    ],
    commonMisconceptions: [
      'Confusing modifying a referenced object with reassigning the parameter reference',
      'Expecting return values from functions with void or implicit return'
    ],
  },
  'arrays': {
    id: 'arrays',
    name: 'Arrays and Contiguous Memory',
    category: 'Data Structures',
    prerequisites: ['loops', 'functions'],
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    importance: 'critical',
    masteryScore: 20, // WEAK!
    status: 'WEAK',
    attemptsCount: 2,
    correctCount: 0,
    lastAssessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionAt: new Date().toISOString(), // Due today!
    revisionIntervalDays: 1,
    retentionRate: 30,
    keyPoints: [
      'Contiguous memory allocation and constant-time O(1) index access',
      'Array bounds checking and buffer overflow hazards',
      'Dynamic arrays: Amortized insertion and resizing'
    ],
    commonMisconceptions: [
      'Believing inserting in an array is O(1) instead of O(N) element shifting',
      'Confusing array size with allocated capacity'
    ],
  },
  'recursion': {
    id: 'recursion',
    name: 'Recursion and Call Stack',
    category: 'Algorithms',
    prerequisites: ['functions'],
    difficulty: 'advanced',
    estimatedMinutes: 40,
    importance: 'critical',
    masteryScore: 15, // WEAK! Missing prerequisite Functions!
    status: 'WEAK',
    attemptsCount: 2,
    correctCount: 0,
    lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionAt: new Date().toISOString(),
    revisionIntervalDays: 1,
    retentionRate: 25,
    keyPoints: [
      'Base cases and inductive hypothesis',
      'Call stack frame allocation and stack depth limits',
      'Tail call optimization'
    ],
    commonMisconceptions: [
      'Omitting base case causing Call Stack Overflow',
      'Failing to return the result of recursive child calls'
    ],
  },
  'complexity': {
    id: 'complexity',
    name: 'Asymptotic Complexity (Big-O)',
    category: 'Analysis',
    prerequisites: ['loops', 'recursion'],
    difficulty: 'advanced',
    estimatedMinutes: 35,
    importance: 'critical',
    masteryScore: 42,
    status: 'LEARNING',
    attemptsCount: 3,
    correctCount: 1,
    lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    revisionIntervalDays: 3,
    retentionRate: 60,
    keyPoints: [
      'Big-O upper bound, Big-Omega lower bound, Big-Theta tight bound',
      'Worst-case, average-case, and best-case analysis',
      'Dominant terms and constant factor dropping'
    ],
    commonMisconceptions: [
      'Treating Big-O as worst case only (it can describe worst, best, or average)',
      'Thinking O(1) means exactly one CPU instruction'
    ],
  },
  'trees': {
    id: 'trees',
    name: 'Binary Trees and Traversals',
    category: 'Data Structures',
    prerequisites: ['recursion', 'arrays'],
    difficulty: 'advanced',
    estimatedMinutes: 45,
    importance: 'high',
    masteryScore: 0,
    status: 'UNASSESSED',
    attemptsCount: 0,
    correctCount: 0,
    revisionIntervalDays: 1,
    retentionRate: 0,
    keyPoints: [
      'Node definitions and pointer hierarchy',
      'Depth-First Search (Pre-order, In-order, Post-order)',
      'Breadth-First Search (Level-order) using Queues'
    ],
    commonMisconceptions: [
      'Confusing Binary Tree with Binary Search Tree (BST)',
      'Assuming in-order traversal always produces sorted order for any binary tree'
    ],
  },
};

export const DEMO_KNOWLEDGE_MAP: KnowledgeMap = {
  subjectId: 'dsa-101',
  subjectName: 'Data Structures & Algorithms',
  concepts: DEMO_CONCEPTS,
  overallMastery: 45,
  weakConceptIds: ['functions', 'arrays', 'recursion'],
  masteredConceptIds: ['variables', 'control-flow'],
  updatedAt: new Date().toISOString(),
};

export const DEMO_ASSESSMENT_HISTORY: AssessmentResult[] = [
  {
    id: 'hist-1',
    conceptId: 'functions',
    conceptName: 'Functions and Modular Decomposition',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalQuestions: 4,
    correctQuestions: 1,
    scorePercentage: 25,
    timeSpentSeconds: 140,
    attempts: [],
    strengths: ['Function syntax identification'],
    weaknesses: ['Pass-by-reference vs value', 'Closures & lexical scope'],
    identifiedGaps: ['functions', 'recursion'],
    previousMastery: 40,
    newMastery: 35,
    recommendedAction: 'Step back to foundational parameter mechanics before attempting recursive functions.',
    nextConceptRecommendation: 'functions',
  },
  {
    id: 'hist-2',
    conceptId: 'loops',
    conceptName: 'Loops and Iterative Patterns',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    totalQuestions: 4,
    correctQuestions: 3,
    scorePercentage: 75,
    timeSpentSeconds: 110,
    attempts: [],
    strengths: ['Entry vs exit control', 'While loop termination'],
    weaknesses: ['Nested loop complexity calculation'],
    identifiedGaps: ['complexity'],
    previousMastery: 65,
    newMastery: 74,
    recommendedAction: 'Mastery elevated to 74%. Ready for advanced practice or functions remediation.',
    nextConceptRecommendation: 'functions',
  },
];
