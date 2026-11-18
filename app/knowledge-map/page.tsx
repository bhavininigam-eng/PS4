'use client';

import React, { useEffect, useState } from 'react';
import { getKnowledgeMap, subscribeToStore } from '@/lib/store';
import { KnowledgeMap } from '@/lib/types';
import { KnowledgeGraphView } from '@/components/KnowledgeGraphView';
import { GitFork, Sparkles } from 'lucide-react';

export default function KnowledgeMapPage() {
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null);

  useEffect(() => {
    setKnowledgeMap(getKnowledgeMap());
    const unsub = subscribeToStore(() => {
      setKnowledgeMap(getKnowledgeMap());
    });
    return () => unsub();
  }, []);

  if (!knowledgeMap) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-400">Loading concept topology...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <GitFork className="w-4 h-4" />
            Feature 9: Visual Knowledge Map & Prerequisite Graph
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">Curriculum Concept Graph</h1>
          <p className="text-sm text-slate-400 mt-1">
            Visual topological map of {knowledgeMap.subjectName}. Arrows denote prerequisite dependencies that must be mastered first.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-4 text-xs">
          <div>
            <div className="text-slate-400">Subject Mastery</div>
            <div className="text-lg font-bold text-white">{knowledgeMap.overallMastery}%</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400">Total Concepts</div>
            <div className="text-lg font-bold text-cyan-400">{Object.keys(knowledgeMap.concepts).length}</div>
          </div>
        </div>
      </div>

      <KnowledgeGraphView knowledgeMap={knowledgeMap} />
    </div>
  );
}
