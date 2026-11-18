'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  Flame,
  Clock,
  Target,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  GitFork,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { getProfile, getKnowledgeMap, getRoadmap, getAssessments, subscribeToStore } from '@/lib/store';
import { StudentProfile, KnowledgeMap, PersonalizedRoadmap, AssessmentResult } from '@/lib/types';
import { MasteryBadge } from '@/components/MasteryBadge';
import { getRevisionQueue } from '@/lib/spacedRevisionEngine';

export default function DashboardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null);
  const [roadmap, setRoadmap] = useState<PersonalizedRoadmap | null>(null);
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);

  useEffect(() => {
    const refresh = () => {
      setProfile(getProfile());
      setKnowledgeMap(getKnowledgeMap());
      setRoadmap(getRoadmap());
      setAssessments(getAssessments());
    };
    refresh();
    const unsub = subscribeToStore(refresh);
    return () => unsub();
  }, []);

  if (!profile || !knowledgeMap) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading student knowledge profile...</p>
      </div>
    );
  }

  const concepts = Object.values(knowledgeMap.concepts);
  const masteredCount = concepts.filter((c) => c.status === 'MASTERED').length;
  const learningCount = concepts.filter((c) => c.status === 'LEARNING').length;
  const weakConcepts = concepts.filter((c) => c.status === 'WEAK' || c.masteryScore < 40);
  const revisionQueue = getRevisionQueue(knowledgeMap.concepts);

  // Highest priority next step from roadmap
  const nextStep = roadmap?.steps.find((s) => !s.completed) || roadmap?.steps[0];

  return (
    <div className="space-y-8 py-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-cyan-950/40 border border-indigo-900/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Personalized Dashboard
            </span>
            {profile.isDemoStudent && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono border border-indigo-500/30">
                Synthetic Benchmark Persona
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {profile.displayName} 👋
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Currently mastering <span className="text-white font-semibold">{knowledgeMap.subjectName}</span>. Your next exam sprint has{' '}
            <span className="text-cyan-400 font-bold">{roadmap?.daysRemaining || 7} days remaining</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0">
          <Link
            href="/roadmap"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
          >
            <Target className="w-4 h-4 text-cyan-300" />
            Resume Study Sprint
          </Link>
          <Link
            href="/tutor"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Ask AI Tutor
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Subject Mastery */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Subject Mastery</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{knowledgeMap.overallMastery}%</span>
            <span className="text-xs text-slate-400 font-medium">calculated</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${knowledgeMap.overallMastery}%` }}
            />
          </div>
        </div>

        {/* Study Streak */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Study Consistency</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">5</span>
            <span className="text-xs text-amber-400 font-bold">Days Streak 🔥</span>
          </div>
          <p className="text-[11px] text-slate-400">Target: {profile.dailyStudyMinutes} mins/day</p>
        </div>

        {/* Concept Inventory */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Curriculum Inventory</span>
            <GitFork className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{masteredCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {concepts.length} Mastered</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-amber-400">{learningCount} learning</span>
            <span>•</span>
            <span className="text-rose-400">{weakConcepts.length} weak gaps</span>
          </div>
        </div>

        {/* Revisions Due */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Spaced Revision Queue</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {revisionQueue.dueToday.length + revisionQueue.overdue.length}
            </span>
            <span className="text-xs text-purple-400 font-bold">Due Today</span>
          </div>
          <p className="text-[11px] text-slate-400">{revisionQueue.upcoming.length} upcoming scheduled</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Actionable Next Recommendation & Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Immediate Recommendation Card */}
          {nextStep && (
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                <Sparkles className="w-4 h-4" />
                Adaptive AI Tutor Priority Action
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{nextStep.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    {nextStep.reason}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {nextStep.estimatedMinutes} mins
                    </span>
                    <span>•</span>
                    <span className="capitalize text-amber-400 font-medium">
                      Day {nextStep.dayNumber} Goal
                    </span>
                    <span>•</span>
                    <span className="capitalize text-rose-400 font-semibold">
                      Priority: {nextStep.priority}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/tutor?concept=${encodeURIComponent(nextStep.conceptName)}`}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition"
                >
                  Start This Lesson
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Active Knowledge Gaps (High Attention) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Identified Knowledge Gaps</h3>
              </div>
              <Link href="/diagnostic" className="text-xs text-rose-400 hover:underline flex items-center gap-1">
                Run Diagnostic Assessment <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {weakConcepts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Zero weak concepts detected! Your foundational baseline is strong.
              </div>
            ) : (
              <div className="space-y-3">
                {weakConcepts.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{c.name}</span>
                        <MasteryBadge status={c.status} score={c.masteryScore} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Prerequisites: {c.prerequisites.length > 0 ? c.prerequisites.join(', ') : 'None'} • {c.attemptsCount} attempts
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/tutor?concept=${encodeURIComponent(c.name)}`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/40 transition"
                      >
                        Explain Foundational Model
                      </Link>
                      <Link
                        href={`/assessment?conceptId=${c.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                      >
                        Test Gap
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Curriculum Roadmap Preview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Adaptive Learning Path (Day-by-Day Schedule)
              </h3>
              <Link href="/roadmap" className="text-xs text-cyan-400 hover:underline">
                View Full Path →
              </Link>
            </div>

            <div className="space-y-2.5">
              {roadmap?.steps.slice(0, 4).map((step) => (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 text-xs ${
                    step.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300'
                      : 'bg-slate-950/60 border-slate-800 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-cyan-400">
                      D{step.dayNumber}
                    </span>
                    <div>
                      <div className="font-semibold">{step.title}</div>
                      <div className="text-[10px] text-slate-400">{step.estimatedMinutes} mins • {step.actionType}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.completed ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <Link
                        href={`/tutor?concept=${encodeURIComponent(step.conceptName)}`}
                        className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-cyan-300 font-medium"
                      >
                        Learn
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Revision Centre & Recent Assessments */}
        <div className="space-y-6">
          {/* Spaced Revision Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Spaced Revision
              </h3>
              <Link href="/revision" className="text-xs text-purple-400 hover:underline">
                All Revisions →
              </Link>
            </div>

            {revisionQueue.dueToday.length === 0 && revisionQueue.overdue.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No revisions due today. Memory decay is in check!</p>
            ) : (
              <div className="space-y-2.5">
                {[...revisionQueue.overdue, ...revisionQueue.dueToday].slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-white">{item.conceptName}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.status === 'overdue' ? '⚠️ Overdue recall check' : 'Due today'}
                      </div>
                    </div>
                    <Link
                      href={`/assessment?conceptId=${item.conceptId}&type=revision`}
                      className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px]"
                    >
                      Quiz
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Assessment Attempts */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Recent Assessment Results
            </h3>

            {assessments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No tests completed yet. Take your first quiz!</p>
            ) : (
              <div className="space-y-3">
                {assessments.slice(0, 3).map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{a.conceptName}</span>
                      <span
                        className={`font-bold ${
                          a.scorePercentage >= 70
                            ? 'text-emerald-400'
                            : a.scorePercentage >= 40
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {a.scorePercentage}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{a.recommendedAction}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
