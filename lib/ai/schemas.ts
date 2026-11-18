import { z } from 'zod';

export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  conceptContext: z.string().optional(),
  language: z.enum(['english', 'hinglish']).default('english'),
  layer: z.enum(['eli5', 'conceptual', 'step_by_step', 'real_world', 'exam', 'mistakes', 'notes']).default('conceptual'),
  masteryScore: z.number().min(0).max(100).optional(),
});

export const SyllabusParseRequestSchema = z.object({
  subjectName: z.string().min(1, 'Subject name is required').max(100),
  degreeOrCourse: z.string().optional(),
  syllabusText: z.string().min(10, 'Syllabus must have at least 10 characters').max(15000),
});

export const AssessmentGenerationRequestSchema = z.object({
  conceptId: z.string().min(1),
  conceptName: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  questionCount: z.number().min(1).max(10).default(5),
  studentMastery: z.number().min(0).max(100).optional(),
});

export const AssessmentSubmitSchema = z.object({
  conceptId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      studentAnswer: z.string(),
      timeSpentSeconds: z.number().nonnegative().default(0),
    })
  ).min(1, 'At least one answer must be submitted'),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type SyllabusParseRequest = z.infer<typeof SyllabusParseRequestSchema>;
export type AssessmentGenerationRequest = z.infer<typeof AssessmentGenerationRequestSchema>;
export type AssessmentSubmit = z.infer<typeof AssessmentSubmitSchema>;
