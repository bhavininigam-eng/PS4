'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Concept, KnowledgeMap } from '@/lib/types';
import { MasteryBadge } from './MasteryBadge';
import { ArrowRight, BookOpen, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface KnowledgeGraphViewProps {
  knowledgeMap: KnowledgeMap;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ knowledgeMap }) => {
  const concepts = knowledgeMap.concepts;
  const conceptList = Object.values(concepts);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(
    conceptList.find((c) => c.status === 'WEAK') || conceptList[0] || null
  );

  const getStatusBorder = (status: Concept['status']) => {
    switch (status) {
      case 'MASTERED':
        return 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
      case 'WEAK':
        return 'border-rose-500 bg-rose-500/10 text-rose-300 animate-pulse';
      case 'LEARNING':
        return 'border-amber-500 bg-amber-500/10 text-amber-300';
      case 'REVISION_REQUIRED':
        return 'border-purple-500 bg-purple-500/10 text-purple-300';
      default:
        return 'border-slate-700 bg-slate-800/40 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Concept Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Mastered (≥80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-300">Learning (40-79%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-300">Weak Gap (&lt;40%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-slate-300">Revision Due</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-600" />
            <span className="text-slate-300">Untested</span>
          </div>
        </div>
        <span className="text-indigo-400 font-medium">Click any node to inspect & take action</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Visual Graph Canvas / Nodes */}
        <div className="lg:col-span-2 bg-[#0d1322] border border-slate-800 rounded-2xl p-6 relative overflow-hidden min-h-[460px]">
          <div className="absolute top-4 right-4 text-xs font-mono text-slate-500">
            {knowledgeMap.subjectName} Graph Topology
          </div>

          <div className="space-y-6 pt-4">
            {conceptList.map((c, idx) => {
              const isSelected = selectedConcept?.id === c.id;
              const prereqNames = c.prerequisites
                .map((pid) => concepts[pid]?.name)
                .filter(Boolean)
                .join(', ');

              return (
                <div key={c.id} className="relative group">
                  {/* Prerequisite Flow Line */}
                  {c.prerequisites.length > 0 && (
                    <div className="absolute -top-4 left-6 h-4 w-0.5 bg-slate-700/80 -z-0" />
                  )}

                  <div
                    onClick={() => setSelectedConcept(c)}
                    className={`cursor-pointer transition-all rounded-xl p-4 border-2 flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                        : 'hover:border-slate-600'
                    } ${getStatusBorder(c.status)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900/80 border border-current flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white text-sm">{c.name}</h4>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                            {c.category}
                          </span>
                        </div>
                        {prereqNames && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Requires: <span className="text-indigo-300">{prereqNames}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold">{c.masteryScore}%</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{c.status}</div>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-500'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Concept Deep-Dive Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          {selectedConcept ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Selected Concept Node
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedConcept.name}</h3>
                </div>
                <MasteryBadge status={selectedConcept.status} score={selectedConcept.masteryScore} />
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Difficulty</span>
                  <div className="font-bold text-white uppercase mt-0.5">{selectedConcept.difficulty}</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Importance</span>
                  <div className="font-bold text-indigo-300 uppercase mt-0.5">{selectedConcept.importance}</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Total Attempts</span>
                  <div className="font-bold text-white mt-0.5">{selectedConcept.attemptsCount} quizzes</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Estimated Study</span>
                  <div className="font-bold text-cyan-300 mt-0.5">{selectedConcept.estimatedMinutes} mins</div>
                </div>
              </div>

              {/* Key Concept Points */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Learning Objectives
                </h4>
                <div className="space-y-1.5">
                  {selectedConcept.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <Link
                  href={`/tutor?concept=${encodeURIComponent(selectedConcept.name)}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  Teach Me This Concept (AI Tutor)
                </Link>

                <Link
                  href={`/assessment?conceptId=${selectedConcept.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition border border-slate-700"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  Take Concept Assessment Quiz
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Select a node from the knowledge graph to view diagnostics and options.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
