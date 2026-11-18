'use client';

import React, { useState } from 'react';
import { TeachingExplanation, LanguagePreference } from '@/lib/types';
import {
  Sparkles,
  BookOpen,
  ListOrdered,
  Globe,
  GraduationCap,
  AlertOctagon,
  FileText,
  Languages,
  CheckCircle,
} from 'lucide-react';

interface ExplanationCardProps {
  explanation: TeachingExplanation;
  onLanguageToggle?: (lang: LanguagePreference) => void;
  isLoading?: boolean;
}

type LayerTab = 'eli5' | 'conceptual' | 'step_by_step' | 'real_world' | 'exam' | 'mistakes' | 'notes';

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  explanation,
  onLanguageToggle,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<LayerTab>('conceptual');

  const tabs: { id: LayerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'eli5', label: "Explain Like I'm 5", icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'conceptual', label: 'Conceptual Deep-Dive', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
    { id: 'step_by_step', label: 'Step-by-Step Flow', icon: <ListOrdered className="w-4 h-4 text-indigo-400" /> },
    { id: 'real_world', label: 'Real-World Production', icon: <Globe className="w-4 h-4 text-emerald-400" /> },
    { id: 'exam', label: 'Exam-Oriented Answer', icon: <GraduationCap className="w-4 h-4 text-violet-400" /> },
    { id: 'mistakes', label: 'Common Pitfalls', icon: <AlertOctagon className="w-4 h-4 text-rose-400" /> },
    { id: 'notes', label: 'Quick Revision Notes', icon: <FileText className="w-4 h-4 text-teal-400" /> },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-indigo-400">
              Personalized Multi-Layer Lesson
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">{explanation.conceptName}</h2>
        </div>

        {/* Language Preference Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-1">
          <Languages className="w-4 h-4 text-slate-400 ml-2" />
          <button
            onClick={() => onLanguageToggle && onLanguageToggle('english')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              explanation.language === 'english'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLanguageToggle && onLanguageToggle('hinglish')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              explanation.language === 'hinglish'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hinglish
          </button>
        </div>
      </div>

      {/* 7 Layer Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/20 px-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="p-6">
        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">Synthesizing personalized pedagogy...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'eli5' && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm mb-2">
                  <Sparkles className="w-4 h-4" />
                  Intuitive Mental Model
                </div>
                <p className="text-slate-200 text-base leading-relaxed">
                  {explanation.beginnerELI5}
                </p>
              </div>
            )}

            {activeTab === 'conceptual' && (
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm mb-2">
                  <BookOpen className="w-4 h-4" />
                  Formal Computer Science Definition
                </div>
                <p className="text-slate-200 text-base leading-relaxed">
                  {explanation.conceptual}
                </p>
              </div>
            )}

            {activeTab === 'step_by_step' && (
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm mb-1">
                  <ListOrdered className="w-4 h-4" />
                  Execution Sequence & Logic Gates
                </div>
                <div className="space-y-2.5">
                  {explanation.stepByStep.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-slate-200 text-sm leading-relaxed"
                    >
                      <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'real_world' && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-2">
                  <Globe className="w-4 h-4" />
                  Industry Software Engineering Context
                </div>
                <p className="text-slate-200 text-base leading-relaxed">
                  {explanation.realWorldExample}
                </p>
              </div>
            )}

            {activeTab === 'exam' && (
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
                  <GraduationCap className="w-4 h-4" />
                  University Examination Full-Credit Format
                </div>
                <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line">
                  {explanation.examOrientedAnswer}
                </p>
              </div>
            )}

            {activeTab === 'mistakes' && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm mb-1">
                  <AlertOctagon className="w-4 h-4" />
                  High-Frequency Student Misconceptions & Bugs
                </div>
                <div className="space-y-2">
                  {explanation.commonMistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-lg border border-rose-900/30 text-slate-300 text-sm"
                    >
                      <span className="text-rose-400 font-bold shrink-0">✕</span>
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  High-Yield Memory Bullet Points
                </div>
                <div className="space-y-2">
                  {explanation.quickRevisionNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-slate-200 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
