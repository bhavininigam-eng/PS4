import { NextResponse } from 'next/server';
import { getAIStatus } from '@/lib/ai/geminiProvider';

export async function GET() {
  const status = getAIStatus();
  return NextResponse.json(status);
}
