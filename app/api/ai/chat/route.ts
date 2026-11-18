import { NextRequest, NextResponse } from 'next/server';
import { ChatRequestSchema } from '@/lib/ai/schemas';
import { generateAITutoringExplanation } from '@/lib/ai/geminiProvider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ChatRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid chat request', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { message, conceptContext, language, layer, masteryScore } = validated.data;
    const conceptToTeach = conceptContext || message.slice(0, 50);

    const result = await generateAITutoringExplanation({
      conceptName: conceptToTeach,
      language,
      layer,
      studentMastery: masteryScore,
    });

    return NextResponse.json({
      success: true,
      explanation: result.explanation,
      isFallback: result.isFallback,
      selectedLayer: layer,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing tutor chat' },
      { status: 500 }
    );
  }
}
