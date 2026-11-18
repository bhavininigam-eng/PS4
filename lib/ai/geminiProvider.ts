import { AIProviderStatus, TeachingExplanation, Question } from '../types';
import { getDeterministicExplanation, generateDeterministicQuestions } from './fallbackEngine';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

export function getAIStatus(): AIProviderStatus {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasKey = Boolean(apiKey && apiKey.trim().length > 5);
  return {
    isLiveAI: hasKey,
    model: DEFAULT_MODEL,
    hasKey,
  };
}

export async function generateAITutoringExplanation(params: {
  conceptName: string;
  language: 'english' | 'hinglish';
  layer?: string;
  studentMastery?: number;
}): Promise<{ explanation: TeachingExplanation; isFallback: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim().length < 5) {
    return {
      explanation: getDeterministicExplanation(params.conceptName, params.language, params.layer),
      isFallback: true,
    };
  }

  const prompt = `
You are LearnLoop AI, an elite university tutor. Explain the concept "${params.conceptName}" tailored to an undergraduate student.
Language: ${params.language === 'hinglish' ? 'Hinglish (mix of conversational Hindi & technical English)' : 'English'}.
Current student mastery: ${params.studentMastery ?? 50}%.

Respond with ONLY valid JSON strictly adhering to this schema:
{
  "beginnerELI5": "1-2 sentence intuitive analogy",
  "conceptual": "Rigorous yet crystal-clear conceptual definition",
  "stepByStep": ["Step 1...", "Step 2...", "Step 3..."],
  "realWorldExample": "Concrete engineering/real-world production example",
  "examOrientedAnswer": "How to structure a high-scoring university examination answer",
  "commonMistakes": ["Mistake 1...", "Mistake 2..."],
  "quickRevisionNotes": ["Key point 1...", "Key point 2..."],
  "recommendedFollowUps": ["Topic 1...", "Topic 2..."]
}
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
            temperature: 0.3,
          },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`Gemini API returned status ${res.status}. Falling back to deterministic engine.`);
      return {
        explanation: getDeterministicExplanation(params.conceptName, params.language, params.layer),
        isFallback: true,
      };
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini');

    const parsed = JSON.parse(rawText);
    return {
      explanation: {
        conceptId: params.conceptName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        conceptName: params.conceptName,
        language: params.language,
        beginnerELI5: parsed.beginnerELI5 || '',
        conceptual: parsed.conceptual || '',
        stepByStep: Array.isArray(parsed.stepByStep) ? parsed.stepByStep : [],
        realWorldExample: parsed.realWorldExample || '',
        examOrientedAnswer: parsed.examOrientedAnswer || '',
        commonMistakes: Array.isArray(parsed.commonMistakes) ? parsed.commonMistakes : [],
        quickRevisionNotes: Array.isArray(parsed.quickRevisionNotes) ? parsed.quickRevisionNotes : [],
        recommendedFollowUps: Array.isArray(parsed.recommendedFollowUps) ? parsed.recommendedFollowUps : [],
      },
      isFallback: false,
    };
  } catch (err) {
    console.warn('Gemini request failed, activating deterministic fallback:', err);
    return {
      explanation: getDeterministicExplanation(params.conceptName, params.language, params.layer),
      isFallback: true,
    };
  }
}

export async function generateAIAssessmentQuestions(params: {
  conceptId: string;
  conceptName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
}): Promise<{ questions: Question[]; isFallback: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim().length < 5) {
    return {
      questions: generateDeterministicQuestions(params.conceptId, params.conceptName, params.difficulty, params.questionCount),
      isFallback: true,
    };
  }

  const prompt = `
Generate ${params.questionCount} high-quality diagnostic/assessment questions for the university topic "${params.conceptName}".
Difficulty: ${params.difficulty}.

Return ONLY valid JSON matching this schema:
[
  {
    "id": "q1",
    "prompt": "Question text...",
    "questionType": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact matching string from options",
    "explanation": "Why this is correct",
    "misconceptionExplanation": "Why common wrong answers are incorrect"
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

    if (!res.ok) {
      return {
        questions: generateDeterministicQuestions(params.conceptId, params.conceptName, params.difficulty, params.questionCount),
        isFallback: true,
      };
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty text from Gemini');

    const parsedArray = JSON.parse(rawText);
    if (!Array.isArray(parsedArray) || parsedArray.length === 0) throw new Error('Invalid format');

    const questions: Question[] = parsedArray.map((item, i) => ({
      id: item.id || `q-${params.conceptId}-${i + 1}`,
      conceptId: params.conceptId,
      conceptName: params.conceptName,
      difficulty: params.difficulty,
      questionType: item.questionType || 'mcq',
      prompt: item.prompt,
      options: item.options || [],
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      misconceptionExplanation: item.misconceptionExplanation,
    }));

    return { questions, isFallback: false };
  } catch (err) {
    console.warn('Gemini question generation error, using fallback:', err);
    return {
      questions: generateDeterministicQuestions(params.conceptId, params.conceptName, params.difficulty, params.questionCount),
      isFallback: true,
    };
  }
}
