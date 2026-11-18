'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PieChart,
  Target,
} from 'lucide-react';
import { getKnowledgeMap, getAssessments, subscribeToStore } from '@/lib/store';
import { KnowledgeMap, AssessmentResult } from '@/lib/types';
import { MasteryBadge } from '@/components/MasteryBadge';

export default function AnalyticsPage() {
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null);
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);

  useEffect(() => {
    const refresh = () => {
      setKnowledgeMap(getKnowledgeMap());
      setAssessments(getAssessments());
    };
    refresh();
    const unsub = subscribeToStore(refresh);
    return () => unsub();
  }, []);

  if (!knowledgeMap) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-400">Loading learning analytics...</p>
      </div>
    );
  }

  const concepts = Object.values(knowledgeMap.concepts);
  const mastered = concepts.filter((c) => c.status === 'MASTERED');
  const learning = concepts.filter((c) => c.status === 'LEARNING');
  const weak = concepts.filter((c) => c.status === 'WEAK');
  const untested = concepts.filter((c) => c.status === 'UNASSESSED');

  const total = concepts.length || 1;
  const masteredPct = Math.round((mastered.length / total) * 100);
  const learningPct = Math.round((learning.length / total) * 100);
  const weakPct = Math.round((weak.length / total) * 100);
  const untestedPct = Math.round((untested.length / total) * 100);

  const totalQuizzesTaken = assessments.length;
  const averageScore =
    totalQuizzesTaken > 0
      ? Math.round(
          assessments.reduce((sum, a) => sum + a.scorePercentage, 0) / totalQuizzesTaken
        )
      : 0;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          Feature 10: Analytics & Real Progress Insights
        </div>
        <h1 className="text-3xl font-bold text-white mt-1">Learner Performance Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Every chart and metric derives strictly from verified student assessment attempts.
        </p>
      </div>

      {/* Primary Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400">Curriculum Mastery</span>
          <div className="text-3xl font-black text-white">{knowledgeMap.overallMastery}%</div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> Calibrated weighted model
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400">Quizzes Completed</span>
          <div className="text-3xl font-black text-white">{totalQuizzesTaken}</div>
          <div className="text-[11px] text-indigo-300 font-medium">All attempts logged</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400">Mean Assessment Accuracy</span>
          <div className="text-3xl font-black text-white">{averageScore}%</div>
          <div className="text-[11px] text-cyan-300 font-medium">Across all tested concepts</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400">Mastered Concepts</span>
          <div className="text-3xl font-black text-emerald-400">
            {mastered.length} <span className="text-xs text-slate-400 font-normal">/ {total}</span>
          </div>
          <div className="text-[11px] text-slate-400">{weak.length} remaining weak gaps</div>
        </div>
      </div>

      {/* Mastery Distribution Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          Mastery Distribution Breakdown
        </h3>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-950">
          <div style={{ width: `${masteredPct}%` }} className="bg-emerald-500 h-full" title={`Mastered: ${masteredPct}%`} />
          <div style={{ width: `${learningPct}%` }} className="bg-amber-500 h-full" title={`Learning: ${learningPct}%`} />
          <div style={{ width: `${weakPct}%` }} className="bg-rose-500 h-full" title={`Weak: ${weakPct}%`} />
          <div style={{ width: `${untestedPct}%` }} className="bg-slate-700 h-full" title={`Untested: ${untestedPct}%`} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <div className="font-bold text-white">Mastered ({masteredPct}%)</div>
              <div className="text-slate-400">{mastered.length} concepts</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <div className="font-bold text-white">Learning ({learningPct}%)</div>
              <div className="text-slate-400">{learning.length} concepts</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <div>
              <div className="font-bold text-white">Weak Gaps ({weakPct}%)</div>
              <div className="text-slate-400">{weak.length} concepts</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700 shrink-0" />
            <div>
              <div className="font-bold text-white">Untested ({untestedPct}%)</div>
              <div className="text-slate-400">{untested.length} concepts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Concept-by-Concept Mastery Ranking */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          Concept-Wise Verified Competence
        </h3>

        <div className="space-y-3">
          {concepts.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 sm:max-w-md">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{c.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                    {c.difficulty}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Attempts: {c.attemptsCount} • Retention score: {c.retentionRate}%
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="w-32 bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.masteryScore >= 80
                        ? 'bg-emerald-500'
                        : c.masteryScore >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${c.masteryScore}%` }}
                  />
                </div>
                <div className="font-bold text-white min-w-[36px] text-right">
                  {c.masteryScore}%
                </div>
                <MasteryBadge status={c.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
