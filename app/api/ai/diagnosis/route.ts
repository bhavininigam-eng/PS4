import { NextRequest, NextResponse } from 'next/server';
import { analyzeKnowledgeGaps } from '@/lib/gapDetectionEngine';
import { KnowledgeMap } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { knowledgeMap, attempts } = body as {
      knowledgeMap: KnowledgeMap;
      attempts: any[];
    };

    if (!knowledgeMap || !knowledgeMap.concepts) {
      return NextResponse.json({ error: 'Valid knowledge map is required' }, { status: 400 });
    }

    const report = analyzeKnowledgeGaps(knowledgeMap, attempts || []);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Diagnosis API Error:', error);
    return NextResponse.json({ error: 'Failed to perform diagnostic analysis' }, { status: 500 });
  }
}
