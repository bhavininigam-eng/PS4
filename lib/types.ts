export type LanguagePreference = 'english' | 'hinglish';
export type LearningStyle = 'conceptual' | 'example_driven' | 'step_by_step' | 'exam_focused';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'foundational';

export type ConceptStatus =
  | 'UNASSESSED'
  | 'WEAK'
  | 'LEARNING'
  | 'REVISION_REQUIRED'
  | 'MASTERED';

export interface Concept {
  id: string;
  name: string;
  category: string;
  prerequisites: string[];
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  importance: ImportanceLevel;
  masteryScore: number; // 0 to 100
  status: ConceptStatus;
  attemptsCount: number;
  correctCount: number;
  lastAssessedAt?: string;
  nextRevisionAt?: string;
  revisionIntervalDays: number;
  retentionRate: number; // 0 to 100
  keyPoints: string[];
  commonMisconceptions: string[];
}

export interface StudentProfile {
  id: string;
  displayName: string;
  educationLevel: string;
  degree: string;
  subject: string;
  targetGoal: string;
  examDate?: string;
  dailyStudyMinutes: number;
  preferredLanguage: LanguagePreference;
  preferredLearningStyle: LearningStyle;
  topicConfidences: Record<string, number>; // 0 to 100
  createdAt: string;
  updatedAt: string;
  isDemoStudent: boolean;
}

export interface KnowledgeMap {
  subjectId: string;
  subjectName: string;
  concepts: Record<string, Concept>;
  overallMastery: number;
  weakConceptIds: string[];
  masteredConceptIds: string[];
  updatedAt: string;
}

export type QuestionType = 'mcq' | 'true_false' | 'fill_in_the_blank' | 'short_answer';

export interface Question {
  id: string;
  conceptId: string;
  conceptName: string;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  prompt: string;
  options?: string[]; // for mcq
  correctAnswer: string;
  explanation: string;
  misconceptionExplanation?: string;
  prerequisiteHint?: string;
}

export interface QuestionAttempt {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  errorType?: 'conceptual' | 'procedural' | 'careless';
}

export interface AssessmentResult {
  id: string;
  conceptId: string;
  conceptName: string;
  timestamp: string;
  totalQuestions: number;
  correctQuestions: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  attempts: (Question & { studentAnswer: string; isCorrect: boolean; feedback: string })[];
  strengths: string[];
  weaknesses: string[];
  identifiedGaps: string[];
  previousMastery: number;
  newMastery: number;
  recommendedAction: string;
  nextConceptRecommendation?: string;
}

export interface RoadmapStep {
  id: string;
  dayNumber: number;
  conceptId: string;
  conceptName: string;
  title: string;
  estimatedMinutes: number;
  priority: 'urgent' | 'high' | 'medium';
  actionType: 'learn_foundational' | 'guided_practice' | 'revision' | 'mastery_challenge';
  completed: boolean;
  reason: string;
  prerequisitesMet: boolean;
}

export interface PersonalizedRoadmap {
  id: string;
  studentId: string;
  generatedAt: string;
  examDate?: string;
  daysRemaining: number;
  dailyCommitmentMinutes: number;
  steps: RoadmapStep[];
  totalMinutes: number;
  completionPercentage: number;
}

export interface TeachingExplanation {
  conceptId: string;
  conceptName: string;
  language: LanguagePreference;
  beginnerELI5: string;
  conceptual: string;
  stepByStep: string[];
  realWorldExample: string;
  examOrientedAnswer: string;
  commonMistakes: string[];
  quickRevisionNotes: string[];
  recommendedFollowUps: string[];
}

export interface RevisionItem {
  id: string;
  conceptId: string;
  conceptName: string;
  dueDate: string;
  status: 'due_today' | 'upcoming' | 'overdue' | 'completed';
  repetitionCount: number;
  intervalDays: number;
  lastMasteryScore: number;
  nextIntervalDays: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: LanguagePreference;
  layer?: 'eli5' | 'conceptual' | 'step_by_step' | 'real_world' | 'exam' | 'mistakes' | 'notes';
  conceptContext?: string;
  isFallback?: boolean;
}

export interface AIProviderStatus {
  isLiveAI: boolean;
  model: string;
  hasKey: boolean;
  rateLimited?: boolean;
}
