import { NextRequest, NextResponse } from 'next/server';
import { AssessmentGenerationRequestSchema } from '@/lib/ai/schemas';
import { generateAIAssessmentQuestions } from '@/lib/ai/geminiProvider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = AssessmentGenerationRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid assessment request parameters', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { conceptId, conceptName, difficulty, questionCount } = validated.data;

    const result = await generateAIAssessmentQuestions({
      conceptId,
      conceptName,
      difficulty,
      questionCount,
    });

    return NextResponse.json({
      success: true,
      questions: result.questions,
      isFallback: result.isFallback,
    });
  } catch (error: any) {
    console.error('Assessment API Error:', error);
    return NextResponse.json({ error: 'Failed to generate assessment questions' }, { status: 500 });
  }
}
