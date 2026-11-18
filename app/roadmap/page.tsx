'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { getProfile, getKnowledgeMap, getRoadmap, subscribeToStore } from '@/lib/store';
import { PersonalizedRoadmap, StudentProfile, KnowledgeMap } from '@/lib/types';
import { MasteryBadge } from '@/components/MasteryBadge';

export default function RoadmapPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null);
  const [roadmap, setRoadmap] = useState<PersonalizedRoadmap | null>(null);

  useEffect(() => {
    const refresh = () => {
      setProfile(getProfile());
      setKnowledgeMap(getKnowledgeMap());
      setRoadmap(getRoadmap());
    };
    refresh();
    const unsub = subscribeToStore(refresh);
    return () => unsub();
  }, []);

  if (!roadmap || !knowledgeMap || !profile) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-400">Synthesizing personalized study path...</p>
      </div>
    );
  }

  // Group steps by day
  const stepsByDay: Record<number, typeof roadmap.steps> = {};
  roadmap.steps.forEach((step) => {
    if (!stepsByDay[step.dayNumber]) stepsByDay[step.dayNumber] = [];
    stepsByDay[step.dayNumber].push(step);
  });

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            Feature 3: Personalized Learning Path Generator
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">Adaptive Study Roadmap</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Individualized curriculum sequencing that prioritizes foundational weaknesses and prerequisites before moving forward.
          </p>
        </div>

        {/* Milestone Constraints Badge */}
        <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-6 text-xs">
          <div>
            <div className="text-slate-400">Exam Countdown</div>
            <div className="text-lg font-bold text-cyan-400">{roadmap.daysRemaining} Days</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400">Daily Target</div>
            <div className="text-lg font-bold text-white">{roadmap.dailyCommitmentMinutes} mins/day</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400">Progress</div>
            <div className="text-lg font-bold text-emerald-400">{roadmap.completionPercentage}%</div>
          </div>
        </div>
      </div>

      {/* Dynamic Adaptation Notice */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-indigo-200">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
        <div>
          <span className="font-bold text-white">Dynamic Feedback Loop Active:</span> If you perform poorly on an assessment, LearnLoop AI automatically shifts downstream topics and inserts prerequisite remediation. Scoring ≥80% advances you to challenge modules.
        </div>
      </div>

      {/* Day by Day Plan */}
      <div className="space-y-6">
        {Object.entries(stepsByDay).map(([dayStr, daySteps]) => {
          const dayNum = Number(dayStr);
          const totalDayMinutes = daySteps.reduce((acc, s) => acc + s.estimatedMinutes, 0);
          const isDayCompleted = daySteps.every((s) => s.completed);

          return (
            <div
              key={dayNum}
              className={`rounded-2xl border p-6 transition-all ${
                isDayCompleted
                  ? 'bg-slate-950/40 border-emerald-500/20'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isDayCompleted
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/30'
                    }`}
                  >
                    Day {dayNum}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {dayNum === 1 ? 'Immediate Diagnostic & Remediation Sprint' : `Sprint Phase ${dayNum}`}
                    </h3>
                    <div className="text-xs text-slate-400">
                      Total commitment: <span className="text-white font-medium">{totalDayMinutes} minutes</span>
                    </div>
                  </div>
                </div>

                {isDayCompleted && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" /> Day Goals Mastered
                  </span>
                )}
              </div>

              {/* Steps inside the Day */}
              <div className="space-y-3">
                {daySteps.map((step) => {
                  const concept = knowledgeMap.concepts[step.conceptId];

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition ${
                        step.completed
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : step.priority === 'urgent'
                          ? 'bg-rose-500/5 border-rose-500/30'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-white text-sm">{step.title}</span>
                          {concept && <MasteryBadge status={concept.status} score={concept.masteryScore} size="sm" />}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              step.priority === 'urgent'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {step.priority}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{step.reason}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {step.estimatedMinutes}m
                        </span>

                        <Link
                          href={`/tutor?concept=${encodeURIComponent(step.conceptName)}`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                          Learn
                        </Link>

                        <Link
                          href={`/assessment?conceptId=${step.conceptId}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          Test
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
