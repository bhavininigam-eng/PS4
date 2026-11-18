'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Key,
  Shield,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import {
  getProfile,
  getKnowledgeMap,
  loadDemoExperience,
  resetToBlankStudent,
} from '@/lib/store';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [isLiveAI, setIsLiveAI] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        setIsLiveAI(data.isLiveAI);
        if (data.model) setModel(data.model);
      })
      .catch(() => setIsLiveAI(false));
  }, []);

  const handleExportJSON = () => {
    const data = {
      profile: getProfile(),
      knowledgeMap: getKnowledgeMap(),
      exportedAt: new Date().toISOString(),
      platform: 'LearnLoop AI PS04',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnloop-student-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          System Settings & Platform Architecture
        </div>
        <h1 className="text-3xl font-bold text-white mt-1">Platform Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure AI provider credentials, manage local student state, and inspect engine operation modes.
        </p>
      </div>

      {/* AI Provider Status Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Dual AI Engine Architecture</h3>
          </div>
          {isLiveAI ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Gemini API Active
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Deterministic Pedagogical Engine (Demo Mode)
            </span>
          )}
        </div>

        <div className="text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            LearnLoop AI is designed with an <strong className="text-white">unbreakable dual-layer architecture</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>
              <strong className="text-cyan-300">Live Gemini AI:</strong> When <code className="text-white bg-slate-800 px-1 py-0.5 rounded">GEMINI_API_KEY</code> is configured in the environment, requests are routed to Google Gemini with JSON schema validation.
            </li>
            <li>
              <strong className="text-indigo-300">Deterministic Pedagogical Engine:</strong> If no API key is supplied or if network quotas are reached, the system automatically falls back to curated first-principles pedagogical logic. <strong className="text-emerald-400">Judges can explore every feature seamlessly with zero configuration.</strong>
            </li>
          </ul>
        </div>

        {/* Environment setup instructions */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
          <div className="text-slate-500"># To activate Live Gemini AI on your deployment, configure in .env.local:</div>
          <div className="text-cyan-300">GEMINI_API_KEY=your_google_gemini_api_key_here</div>
          <div className="text-indigo-300">GEMINI_MODEL=gemini-1.5-flash</div>
        </div>
      </div>

      {/* Demo State & Reset Management */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-4">
          <RotateCcw className="w-5 h-5 text-amber-400" />
          Benchmark Persona & State Management
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm">Load Benchmark Demo Student</h4>
            <p className="text-xs text-slate-400">
              Loads "Alex Sharma", a B.Tech CSE student with established mastery in Variables and Control Flow, but critical gaps in Functions and Arrays with 7 days remaining before the exam.
            </p>
            <button
              onClick={() => {
                loadDemoExperience();
                setSaveMessage('Benchmark student (Alex Sharma) reloaded successfully!');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Benchmark Persona
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm">Reset to Clean Blank Slate</h4>
            <p className="text-xs text-slate-400">
              Clears all pre-computed mastery, test attempts, and history. Allows testing student onboarding and diagnostic assessment from zero.
            </p>
            <button
              onClick={() => {
                resetToBlankStudent('General Computer Science');
                setSaveMessage('Reset to clean student profile successfully!');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition"
            >
              Reset to Blank Student
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {saveMessage}
          </div>
        )}
      </div>

      {/* Export / Privacy */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Data Portability & Local-First Privacy
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          LearnLoop AI operates on a privacy-preserving local-first architecture. All student mastery scores and attempts persist securely in client storage. No private data is logged or retained.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export Learner Profile & Knowledge Map (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}
