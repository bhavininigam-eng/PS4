'use client';

import React from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  GitFork,
  Target,
  Award,
  Clock,
  CheckCircle2,
  Zap,
  BookOpen,
  HelpCircle,
  BarChart3,
  Flame,
} from 'lucide-react';
import { loadDemoExperience } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleLaunchDemo = () => {
    loadDemoExperience();
    router.push('/dashboard');
  };

  const adaptiveLoopSteps = [
    { step: '01', title: 'Assess', desc: 'Diagnostic testing probes conceptual boundaries across prerequisite trees.' },
    { step: '02', title: 'Analyse', desc: 'Distinguishes between fundamental misunderstandings and procedural errors.' },
    { step: '03', title: 'Identify Gaps', desc: 'Traces missing foundational dependencies before higher concepts.' },
    { step: '04', title: 'Personalize', desc: 'Builds an exam-deadline aware daily schedule prioritizing weakest blockers.' },
    { step: '05', title: 'Teach', desc: 'Multi-layer pedagogy (ELI5, Conceptual, Step-by-Step, Exam, Hinglish).' },
    { step: '06', title: 'Test', desc: 'Targeted quizzes test retention without revealing answers beforehand.' },
    { step: '07', title: 'Adapt', desc: 'Failed questions lower difficulty; consecutive passes unlock next topics.' },
    { step: '08', title: 'Improve', desc: 'SM-2 spaced revision intervals prevent long-term memory decay.' },
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-[#0b1120] border border-indigo-900/30 p-8 sm:p-12 lg:p-16 text-center">
        {/* Soft background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-cyan-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>PromptWars x Agent X 2.0 • Problem Statement PS04</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Your personal AI tutor that{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
              learns how you learn.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Most platforms serve identical lectures to everyone. LearnLoop AI identifies your hidden foundational knowledge gaps, maps prerequisite dependencies, and adapts every lesson and quiz to your real progress.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/25 transition-transform active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Explore Demo Experience (Instant Judge Tour)
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Onboard New Student & Paste Syllabus
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Zero API Key Required for Demo
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              English & Hinglish Support
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              SM-2 Spaced Repetition Engine
            </span>
          </div>
        </div>
      </section>

      {/* The 8-Step Continuous Adaptive Loop */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
            Algorithmic Core
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            The Continuous Adaptive Learning Loop
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Decisions grounded in student attempts — never simulated, never superficial.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adaptiveLoopSteps.map((item) => (
            <div
              key={item.step}
              className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition rounded-2xl p-5 relative overflow-hidden group"
            >
              <div className="text-3xl font-black font-mono text-slate-800 group-hover:text-indigo-500/20 transition mb-3">
                {item.step}
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">
            Comprehensive Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Engineered for Academic Excellence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Knowledge Gap Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Diagnostic assessments pinpoint whether mistakes stem from missing prerequisites or superficial syntax errors.
            </p>
            <Link href="/diagnostic" className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold hover:underline pt-2">
              Run Diagnostic <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <GitFork className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Visual Prerequisite Map</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore your subject as a directed dependency graph. Watch concept nodes transform from Weak (rose) to Mastered (emerald).
            </p>
            <Link href="/knowledge-map" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold hover:underline pt-2">
              View Concept Graph <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">7-Layer AI Tutor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switch seamlessly between ELI5 analogies, rigorous conceptual proofs, exam-ready answers, and bilingual Hinglish explanations.
            </p>
            <Link href="/tutor" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold hover:underline pt-2">
              Open AI Tutor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Personalized Learning Roadmap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically generates daily study sprints respecting your upcoming exam date and available hours. Never teaches topics in arbitrary order.
            </p>
            <Link href="/roadmap" className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline pt-2">
              Inspect Roadmap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">SM-2 Spaced Revision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mathematical memory decay tracking prompts retention checks before concepts are forgotten, solidifying long-term mastery.
            </p>
            <Link href="/revision" className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-semibold hover:underline pt-2">
              Revision Centre <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Transparent Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Grounded scoring metrics. Inspect your velocity, accuracy breakdown, and verified mastery milestones in real time.
            </p>
            <Link href="/analytics" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold hover:underline pt-2">
              View Insights <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
