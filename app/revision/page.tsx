'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { getKnowledgeMap, subscribeToStore } from '@/lib/store';
import { KnowledgeMap, RevisionItem } from '@/lib/types';
import { getRevisionQueue } from '@/lib/spacedRevisionEngine';
import { MasteryBadge } from '@/components/MasteryBadge';

export default function RevisionPage() {
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null);
  const [revisionData, setRevisionData] = useState<{
    dueToday: RevisionItem[];
    overdue: RevisionItem[];
    upcoming: RevisionItem[];
    completedCount: number;
  }>({
    dueToday: [],
    overdue: [],
    upcoming: [],
    completedCount: 0,
  });

  useEffect(() => {
    const refresh = () => {
      const kmap = getKnowledgeMap();
      setKnowledgeMap(kmap);
      setRevisionData(getRevisionQueue(kmap.concepts));
    };
    refresh();
    const unsub = subscribeToStore(refresh);
    return () => unsub();
  }, []);

  if (!knowledgeMap) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-400">Loading revision schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            Feature 7: Spaced Revision Engine (SM-2 Memory Decay)
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">Revision Centre</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Mathematically schedules recall checks right as memory retention begins to decay. Prevents the Ebbinghaus forgetting curve.
          </p>
        </div>

        {/* Counter Summary */}
        <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-6 text-xs">
          <div>
            <div className="text-slate-400">Due Today</div>
            <div className="text-lg font-bold text-purple-400">{revisionData.dueToday.length}</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400">Overdue</div>
            <div className="text-lg font-bold text-rose-400">{revisionData.overdue.length}</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400">Upcoming</div>
            <div className="text-lg font-bold text-cyan-400">{revisionData.upcoming.length}</div>
          </div>
        </div>
      </div>

      {/* Overdue Section */}
      {revisionData.overdue.length > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            Overdue Retention Checks ({revisionData.overdue.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {revisionData.overdue.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 p-4 rounded-xl border border-rose-900/40 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{item.conceptName}</h4>
                  <p className="text-slate-400 mt-0.5">
                    Interval: {item.intervalDays} days • Last score: {item.lastMasteryScore}%
                  </p>
                </div>
                <Link
                  href={`/assessment?conceptId=${item.conceptId}`}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition"
                >
                  Quick Quiz
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
            <Calendar className="w-4 h-4 text-purple-400" />
            Due Today for Recall Verification ({revisionData.dueToday.length})
          </div>
        </div>

        {revisionData.dueToday.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            All revisions for today are up to date! Great job maintaining your memory curve.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {revisionData.dueToday.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{item.conceptName}</h4>
                  <p className="text-slate-400 mt-0.5">
                    Repetition cycle #{item.repetitionCount} • Interval: {item.intervalDays}d
                  </p>
                </div>
                <Link
                  href={`/assessment?conceptId=${item.conceptId}`}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 transition shadow-md shadow-purple-600/20"
                >
                  Verify Recall
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Revisions Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Scheduled Retention Intervals (Next 30 Days)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {revisionData.upcoming.map((item) => {
            const daysUntil = Math.ceil(
              (new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            return (
              <div
                key={item.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm truncate">{item.conceptName}</span>
                  <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                    In {daysUntil}d
                  </span>
                </div>
                <div className="text-slate-400 flex items-center justify-between text-[11px]">
                  <span>Repetition cycle {item.repetitionCount}</span>
                  <span className="text-emerald-400 font-medium">Mastery {item.lastMasteryScore}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
