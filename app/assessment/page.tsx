'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { getKnowledgeMap, recordAssessment, subscribeToStore } from '@/lib/store';
import { Concept, Question, AssessmentResult } from '@/lib/types';
import confetti from 'canvas-confetti';
import { MasteryBadge } from '@/components/MasteryBadge';

function AssessmentArenaContent() {
  const searchParams = useSearchParams();
  const initialConceptId = searchParams.get('conceptId');

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<string>('functions');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const kmap = getKnowledgeMap();
    const list = Object.values(kmap.concepts);
    setConcepts(list);

    if (initialConceptId && kmap.concepts[initialConceptId]) {
      setSelectedConceptId(initialConceptId);
    } else if (list.length > 0) {
      const weakConcept = list.find((c) => c.status === 'WEAK');
      setSelectedConceptId(weakConcept ? weakConcept.id : list[0].id);
    }
  }, [initialConceptId]);

  // Load questions when selected concept or difficulty changes
  useEffect(() => {
    if (!selectedConceptId) return;

    const currentConcept = concepts.find((c) => c.id === selectedConceptId);
    const conceptName = currentConcept ? currentConcept.name : selectedConceptId;

    setIsLoadingQuestions(true);
    setIsSubmitted(false);
    setUserAnswers({});
    setAssessmentResult(null);

    fetch('/api/ai/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conceptId: selectedConceptId,
        conceptName,
        difficulty,
        questionCount: 4,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setStartTime(Date.now());
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingQuestions(false));
  }, [selectedConceptId, difficulty]);

  const handleSelectAnswer = (qId: string, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: answer,
    }));
  };

  const handleSubmitAssessment = () => {
    if (questions.length === 0 || isSubmitted) return;

    let correctCount = 0;
    const reviewedAttempts = questions.map((q) => {
      const studentAns = userAnswers[q.id] || '';
      const isCorrect = studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) correctCount++;

      return {
        ...q,
        studentAnswer: studentAns,
        isCorrect,
        feedback: isCorrect
          ? `Correct! ${q.explanation}`
          : `Incorrect. Correct answer: "${q.correctAnswer}". ${q.explanation} ${q.misconceptionExplanation ? `Note: ${q.misconceptionExplanation}` : ''}`,
      };
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    const currentConcept = concepts.find((c) => c.id === selectedConceptId);
    const prevMastery = currentConcept?.masteryScore || 0;

    // Feature 6: Adaptive Learning Decision Loop
    let recommendedAction = '';
    let nextConceptId: string | undefined = undefined;

    if (scorePct < 40) {
      recommendedAction = `Score is ${scorePct}%. Foundational gaps detected. Recommend stepping down to Beginner ELI5 tutorial and worked examples before re-testing.`;
      nextConceptId = currentConcept?.prerequisites[0] || selectedConceptId;
    } else if (scorePct >= 40 && scorePct < 60) {
      recommendedAction = `Score is ${scorePct}%. Moderate grasp established. Recommend guided practice with common pitfalls review.`;
      nextConceptId = selectedConceptId;
    } else if (scorePct >= 60 && scorePct < 80) {
      recommendedAction = `Score is ${scorePct}%. Good progress! Intermediate practice recommended to reach the 80% mastery milestone.`;
      nextConceptId = selectedConceptId;
    } else {
      recommendedAction = `Outstanding score of ${scorePct}%! Concept mastery consolidated. System has unlocked next prerequisite-safe topic.`;
      // Find downstream unlocked concept
      const unlockedNext = concepts.find((c) => c.prerequisites.includes(selectedConceptId));
      nextConceptId = unlockedNext ? unlockedNext.id : undefined;

      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // Safe ignore
      }
    }

    const result: AssessmentResult = {
      id: `assessment-${Date.now()}`,
      conceptId: selectedConceptId,
      conceptName: currentConcept?.name || selectedConceptId,
      timestamp: new Date().toISOString(),
      totalQuestions: questions.length,
      correctQuestions: correctCount,
      scorePercentage: scorePct,
      timeSpentSeconds: Math.round((Date.now() - startTime) / 1000),
      attempts: reviewedAttempts,
      strengths: correctCount >= 3 ? ['Deterministic reasoning', 'Core pattern recall'] : ['Attempt effort recorded'],
      weaknesses: correctCount < questions.length ? ['Boundary & edge-case distinction'] : [],
      identifiedGaps: scorePct < 60 ? [selectedConceptId] : [],
      previousMastery: prevMastery,
      newMastery: Math.max(0, Math.min(100, Math.round(prevMastery * 0.6 + scorePct * 0.4))),
      recommendedAction,
      nextConceptRecommendation: nextConceptId,
    };

    setAssessmentResult(result);
    setIsSubmitted(true);
    recordAssessment(result);
  };

  const currentConcept = concepts.find((c) => c.id === selectedConceptId);
  const allAnswered = questions.every((q) => Boolean(userAnswers[q.id]));

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header & Controls */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            Feature 5 & 6: Intelligent Assessment Generator & Adaptive Loop
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">Assessment Arena</h1>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic assessments adapt difficulty in response to your accuracy. Correct answers are kept private until submission.
          </p>
        </div>

        {/* Concept Selector & Difficulty */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedConceptId}
            onChange={(e) => setSelectedConceptId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none"
          >
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.masteryScore}%)
              </option>
            ))}
          </select>

          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
            {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                  difficulty === d
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoadingQuestions ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Synthesizing targeted assessment questions...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const selectedOpt = userAnswers[q.id];
              const isCorrect = selectedOpt?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`bg-slate-900/90 border rounded-2xl p-6 space-y-4 transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-rose-500/40 bg-rose-500/5'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-cyan-400 font-bold">Question {idx + 1} of {questions.length}</span>
                    <span className="uppercase text-[10px] tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                      {q.difficulty} • {q.questionType.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-relaxed">{q.prompt}</h3>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {q.options?.map((option, optIdx) => {
                      const isChosen = selectedOpt === option;
                      const isRightAnswer = option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                      let optStyles = 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700';

                      if (isSubmitted) {
                        if (isRightAnswer) {
                          optStyles = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold';
                        } else if (isChosen && !isRightAnswer) {
                          optStyles = 'border-rose-500 bg-rose-500/20 text-rose-300 line-through';
                        } else {
                          optStyles = 'border-slate-800 bg-slate-950/50 text-slate-500';
                        }
                      } else if (isChosen) {
                        optStyles = 'border-cyan-400 bg-cyan-500/10 text-white font-semibold shadow-sm';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isSubmitted}
                          onClick={() => handleSelectAnswer(q.id, option)}
                          className={`w-full p-3.5 rounded-xl text-left text-xs sm:text-sm font-medium border transition flex items-center justify-between ${optStyles}`}
                        >
                          <span>{option}</span>
                          {isSubmitted && isRightAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {isSubmitted && isChosen && !isRightAnswer && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Post-Submission Detailed Pedagogical Feedback */}
                  {isSubmitted && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {isCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct Answer Analysis
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Misconception Diagnosis
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                      {q.misconceptionExplanation && !isCorrect && (
                        <p className="text-amber-300/90 text-[11px] leading-relaxed">
                          ⚠️ Why this option was tempting: {q.misconceptionExplanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action or Adaptive Loop Result Box */}
          {!isSubmitted ? (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-400">
                {Object.keys(userAnswers).length} of {questions.length} answered
              </span>
              <button
                type="button"
                disabled={!allAnswered}
                onClick={handleSubmitAssessment}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
              >
                Submit Answers & Trigger Adaptive Loop
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            assessmentResult && (
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Adaptive Loop Outcome
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">
                      Assessment Evaluation & Mastery Calibrated
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">
                      {assessmentResult.scorePercentage}%
                    </span>
                    <span className="text-xs text-slate-400">
                      ({assessmentResult.correctQuestions}/{assessmentResult.totalQuestions} correct)
                    </span>
                  </div>
                </div>

                {/* Mastery Transition Metric */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-slate-400">Previous Mastery</div>
                    <div className="text-xl font-bold text-slate-300 mt-1">
                      {assessmentResult.previousMastery}%
                    </div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-slate-400">Updated Official Mastery</div>
                    <div className="text-xl font-bold text-cyan-400 mt-1 flex items-center gap-1.5">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      {assessmentResult.newMastery}%
                    </div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-slate-400">Time Taken</div>
                    <div className="text-xl font-bold text-white mt-1 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      {assessmentResult.timeSpentSeconds}s
                    </div>
                  </div>
                </div>

                {/* Adaptive Recommendation Reason */}
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    Adaptive Next Step Grounded in Student Evidence:
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {assessmentResult.recommendedAction}
                  </p>
                </div>

                {/* Next Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`/tutor?concept=${encodeURIComponent(assessmentResult.conceptName)}`}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition"
                  >
                    <BookOpen className="w-4 h-4" />
                    Remediate with AI Tutor
                  </Link>

                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setUserAnswers({});
                      setAssessmentResult(null);
                      setStartTime(Date.now());
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake Different Set
                  </button>

                  <Link
                    href="/dashboard"
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs transition"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function AssessmentArenaPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-400">Loading Assessment Arena...</p>
        </div>
      }
    >
      <AssessmentArenaContent />
    </Suspense>
  );
}
