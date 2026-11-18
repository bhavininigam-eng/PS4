'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  GitFork,
  Target,
  RefreshCw,
  Clock,
  Award,
} from 'lucide-react';
import { getKnowledgeMap, recordAssessment, subscribeToStore } from '@/lib/store';
import { KnowledgeMap, Question, QuestionAttempt, AssessmentResult } from '@/lib/types';
import { analyzeKnowledgeGaps, GapAnalysisReport } from '@/lib/gapDetectionEngine';
import { generateDeterministicQuestions } from '@/lib/ai/fallbackEngine';

export default function DiagnosticPage() {
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [gapReport, setGapReport] = useState<GapAnalysisReport | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const kmap = getKnowledgeMap();
    setKnowledgeMap(kmap);

    // Generate balanced diagnostic questions across weak and core concepts
    const concepts = Object.values(kmap.concepts);
    const questions: Question[] = [];

    // 1 beginner question from foundations
    const foundational = concepts.find((c) => c.importance === 'foundational') || concepts[0];
    if (foundational) {
      questions.push(...generateDeterministicQuestions(foundational.id, foundational.name, 'beginner', 1));
    }

    // 2 intermediate questions from core/weak topics
    const weakOrCore = concepts.find((c) => c.status === 'WEAK' || c.importance === 'critical') || concepts[1];
    if (weakOrCore) {
      questions.push(...generateDeterministicQuestions(weakOrCore.id, weakOrCore.name, 'intermediate', 2));
    }

    // 1 advanced question
    const advanced = concepts.find((c) => c.difficulty === 'advanced') || concepts[concepts.length - 1];
    if (advanced) {
      questions.push(...generateDeterministicQuestions(advanced.id, advanced.name, 'advanced', 1));
    }

    setDiagnosticQuestions(questions);
    setStartTime(Date.now());
  }, []);

  const handleSelectOption = (questionId: string, option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitDiagnostic = () => {
    if (!knowledgeMap) return;

    const attempts: QuestionAttempt[] = [];
    let correctCount = 0;

    diagnosticQuestions.forEach((q) => {
      const ans = selectedAnswers[q.id] || '';
      const isCorrect = ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) correctCount++;

      // Classify error type
      let errorType: QuestionAttempt['errorType'] = undefined;
      if (!isCorrect) {
        errorType = q.difficulty === 'advanced' ? 'procedural' : 'conceptual';
      }

      attempts.push({
        questionId: q.id,
        studentAnswer: ans,
        isCorrect,
        timeSpentSeconds: 25,
        errorType,
      });
    });

    // Run AI Knowledge Gap Analysis
    const report = analyzeKnowledgeGaps(knowledgeMap, attempts);
    setGapReport(report);
    setIsSubmitted(true);

    // Also record assessment for the primary tested weak concept
    const testedConceptId = diagnosticQuestions[1]?.conceptId || diagnosticQuestions[0]?.conceptId;
    if (testedConceptId) {
      const testedConcept = knowledgeMap.concepts[testedConceptId];
      if (testedConcept) {
        const scorePct = Math.round((correctCount / diagnosticQuestions.length) * 100);
        const result: AssessmentResult = {
          id: `diag-${Date.now()}`,
          conceptId: testedConceptId,
          conceptName: testedConcept.name,
          timestamp: new Date().toISOString(),
          totalQuestions: diagnosticQuestions.length,
          correctQuestions: correctCount,
          scorePercentage: scorePct,
          timeSpentSeconds: Math.round((Date.now() - startTime) / 1000),
          attempts: diagnosticQuestions.map((q) => ({
            ...q,
            studentAnswer: selectedAnswers[q.id] || 'Skipped',
            isCorrect: (selectedAnswers[q.id] || '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase(),
            feedback: q.explanation,
          })),
          strengths: correctCount > 2 ? ['Foundational logic syntax'] : ['Willingness to attempt'],
          weaknesses: correctCount < diagnosticQuestions.length ? ['Prerequisite gap remediation needed'] : [],
          identifiedGaps: report.identifiedGaps.map((g) => g.conceptId),
          previousMastery: testedConcept.masteryScore,
          newMastery: Math.max(10, Math.min(100, Math.round(testedConcept.masteryScore * 0.7 + scorePct * 0.3))),
          recommendedAction: report.immediatePriorityReason,
          nextConceptRecommendation: report.immediatePriorityConceptId,
        };
        recordAssessment(result);
      }
    }
  };

  const currentQ = diagnosticQuestions[currentQuestionIndex];
  const allAnswered = diagnosticQuestions.every((q) => Boolean(selectedAnswers[q.id]));

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          Feature 2: AI Knowledge Gap Detection Engine
        </div>
        <h1 className="text-3xl font-bold text-white mt-1">Adaptive Diagnostic Assessment</h1>
        <p className="text-sm text-slate-400 mt-1">
          Probes your mental model across beginner, intermediate, and advanced boundaries to detect root prerequisite gaps.
        </p>
      </div>

      {!isSubmitted ? (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Question <span className="text-white font-bold">{currentQuestionIndex + 1}</span> of {diagnosticQuestions.length}
            </span>
            <span className="capitalize text-indigo-400 font-medium">
              Topic: {currentQ?.conceptName} ({currentQ?.difficulty})
            </span>
          </div>

          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-indigo-500 h-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / diagnosticQuestions.length) * 100}%`,
              }}
            />
          </div>

          {/* Active Question Box */}
          {currentQ && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-cyan-400">
                  Concept: {currentQ.conceptName}
                </span>
                <h3 className="text-xl font-bold text-white leading-relaxed">
                  {currentQ.prompt}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options?.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQ.id, option)}
                      className={`w-full p-4 rounded-xl text-left text-sm font-medium border transition flex items-center justify-between ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <span>{option}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Question Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  Previous
                </button>

                {currentQuestionIndex < diagnosticQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    Next Question
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!allAnswered}
                    onClick={handleSubmitDiagnostic}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition disabled:opacity-50"
                  >
                    Submit Diagnostic Assessment
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Diagnostic Results & Gap Analysis Report */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">
                  Diagnostic Diagnostic Output
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Knowledge Gap Analysis Report
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/knowledge-map"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <GitFork className="w-4 h-4" />
                  View Updated Concept Graph
                </Link>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers({});
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Root Foundational Blocker Callout */}
            {gapReport?.rootFoundationalBlocker && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  Root Foundational Blocker Detected: {gapReport.rootFoundationalBlocker.conceptName}
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {gapReport.rootFoundationalBlocker.recommendedAction}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/tutor?concept=${encodeURIComponent(gapReport.rootFoundationalBlocker.conceptName)}`}
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-300 font-bold hover:underline"
                  >
                    Start Foundational Tutorial Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Identified Gaps List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Prioritized Gap Remediation Sequence:
              </h4>

              {gapReport?.identifiedGaps.map((gap, i) => (
                <div
                  key={gap.conceptId}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-mono flex items-center justify-center font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span className="font-bold text-white text-sm">{gap.conceptName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400">
                        {gap.gapType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{gap.recommendedAction}</p>
                  </div>

                  <Link
                    href={`/tutor?concept=${encodeURIComponent(gap.conceptName)}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold shrink-0"
                  >
                    Remediate
                  </Link>
                </div>
              ))}
            </div>

            {/* Conceptual vs Procedural Analysis */}
            {gapReport && (
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Conceptual Errors</div>
                  <div className="text-lg font-bold text-rose-400 mt-1">
                    {gapReport.conceptualVsProceduralBreakdown.conceptualCount}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Procedural Errors</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    {gapReport.conceptualVsProceduralBreakdown.proceduralCount}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Careless Errors</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1">
                    {gapReport.conceptualVsProceduralBreakdown.carelessCount}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
