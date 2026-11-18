import { NextRequest, NextResponse } from 'next/server';
import { SyllabusParseRequestSchema } from '@/lib/ai/schemas';
import { parseDeterministicSyllabus } from '@/lib/ai/fallbackEngine';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = SyllabusParseRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid syllabus payload', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { subjectName, syllabusText } = validated.data;
    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini key exists, attempt structured extraction
    if (apiKey && apiKey.trim().length > 5) {
      const prompt = `
Extract a structured university curriculum hierarchy from this syllabus for "${subjectName}".
Syllabus:
"""
${syllabusText.slice(0, 4000)}
"""

Return ONLY a JSON array of concepts strictly matching this schema:
[
  {
    "id": "kebab-case-id",
    "name": "Topic Name",
    "category": "Foundations | Core | Advanced",
    "prerequisites": ["prior-concept-id-if-any"],
    "difficulty": "beginner | intermediate | advanced",
    "estimatedMinutes": 30,
    "importance": "foundational | critical | high | medium",
    "keyPoints": ["point 1", "point 2"],
    "commonMisconceptions": ["misconception 1"]
  }
]
`;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const rawArray = JSON.parse(rawText);
            if (Array.isArray(rawArray) && rawArray.length > 0) {
              const fullConcepts = rawArray.map((c: any, idx: number) => ({
                id: c.id || `concept-${idx + 1}`,
                name: c.name || `Topic ${idx + 1}`,
                category: c.category || subjectName,
                prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
                difficulty: c.difficulty || 'intermediate',
                estimatedMinutes: Number(c.estimatedMinutes) || 30,
                importance: c.importance || 'high',
                masteryScore: 0,
                status: 'UNASSESSED',
                attemptsCount: 0,
                correctCount: 0,
                revisionIntervalDays: 1,
                retentionRate: 100,
                keyPoints: Array.isArray(c.keyPoints) ? c.keyPoints : [],
                commonMisconceptions: Array.isArray(c.commonMisconceptions) ? c.commonMisconceptions : [],
              }));

              return NextResponse.json({
                success: true,
                concepts: fullConcepts,
                isFallback: false,
              });
            }
          }
        }
      } catch (err) {
        console.warn('Gemini syllabus parse failed, falling back:', err);
      }
    }

    // Deterministic fallback
    const fallbackConcepts = parseDeterministicSyllabus(subjectName, syllabusText);
    return NextResponse.json({
      success: true,
      concepts: fallbackConcepts,
      isFallback: true,
    });
  } catch (error: any) {
    console.error('Syllabus API Error:', error);
    return NextResponse.json({ error: 'Failed to parse syllabus' }, { status: 500 });
  }
}
