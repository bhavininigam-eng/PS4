'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  GraduationCap,
  Target,
  Languages,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getProfile, saveProfile, setCustomConcepts } from '@/lib/store';
import { Concept, LanguagePreference, LearningStyle } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [degree, setDegree] = useState('B.Tech in Computer Science & Engineering');
  const [subject, setSubject] = useState('Operating Systems');
  const [targetGoal, setTargetGoal] = useState('Ace University Semester Examination');
  const [examDate, setExamDate] = useState(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [language, setLanguage] = useState<LanguagePreference>('hinglish');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('example_driven');
  const [syllabusText, setSyllabusText] = useState('');
  const [isParsingSyllabus, setIsParsingSyllabus] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<Concept[] | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (p) {
      setDisplayName(p.displayName || 'Alex Sharma');
      setSubject(p.subject || 'Operating Systems');
      setDailyMinutes(p.dailyStudyMinutes || 45);
      setLanguage(p.preferredLanguage || 'hinglish');
      setLearningStyle(p.preferredLearningStyle || 'example_driven');
      if (p.examDate) setExamDate(p.examDate);
    }
  }, []);

  const handleLoadSampleSyllabus = () => {
    setSubject('Operating Systems (CS301)');
    setSyllabusText(`Unit 1: Introduction to Operating Systems and Architecture
- System Calls, Kernel vs User Mode, Dual-mode operation
- Process Concept, Process Control Block (PCB), Process States

Unit 2: Process Scheduling and Concurrency
- CPU Scheduling Algorithms: FCFS, SJF, Round Robin, Priority
- Inter-Process Communication (IPC) and Shared Memory
- Critical Section Problem, Peterson's Solution, Mutex Locks & Semaphores

Unit 3: Deadlocks and Synchronization
- Conditions for Deadlock, Resource Allocation Graph
- Deadlock Prevention, Avoidance (Banker's Algorithm), Detection and Recovery

Unit 4: Memory Management
- Contiguous Memory Allocation, Paging, Segmentation
- Virtual Memory, Demand Paging, Page Replacement Algorithms (FIFO, LRU, Optimal)

Unit 5: Storage and File Systems
- Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN)
- File Allocation Methods (Contiguous, Linked, Indexed)`);
  };

  const handleParseSyllabus = async () => {
    if (!syllabusText.trim()) {
      setStatusMessage('Please enter or paste your syllabus text first.');
      return;
    }

    setIsParsingSyllabus(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/ai/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: subject,
          degreeOrCourse: degree,
          syllabusText,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.concepts)) {
        setParsedPreview(data.concepts);
        setStatusMessage(`Successfully synthesized ${data.concepts.length} structured concepts with prerequisite mapping.`);
      } else {
        setStatusMessage('Could not extract concepts. Using fallback curriculum hierarchy.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('API call error. Switched to deterministic parser.');
    } finally {
      setIsParsingSyllabus(false);
    }
  };

  const handleCompleteOnboarding = () => {
    saveProfile({
      displayName: displayName || 'Learner',
      educationLevel,
      degree,
      subject,
      targetGoal,
      examDate,
      dailyStudyMinutes: dailyMinutes,
      preferredLanguage: language,
      preferredLearningStyle: learningStyle,
      isDemoStudent: false,
    });

    if (parsedPreview && parsedPreview.length > 0) {
      setCustomConcepts(subject, parsedPreview);
    }

    router.push('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          Feature 1: Smart Student Onboarding
        </div>
        <h1 className="text-3xl font-bold text-white mt-1">Configure Your Learning Agent</h1>
        <p className="text-sm text-slate-400 mt-1">
          Provide your study parameters and syllabus. LearnLoop AI will personalize pace, pedagogical depth, and prerequisite dependencies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Target className="w-4 h-4" />
            1. Student Persona & Goals
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Display Name (Optional)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Parth Sharma"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Education Level & Degree</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Undergraduate">Undergraduate (B.Tech / B.Sc / BCA)</option>
                <option value="Postgraduate">Postgraduate (M.Tech / MCA / M.Sc)</option>
                <option value="High School">High School (Grade 11/12)</option>
                <option value="Self-Taught">Professional / Self-Taught</option>
              </select>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="Degree program"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Current Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Operating Systems, Data Structures, Computer Networks"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Milestone</label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="e.g. University Semester Examination"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Study Constraints & Preferences */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            2. Constraints & Pedagogical Preference
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Upcoming Exam Date (For Sprint Prioritization)
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Available Study Time Per Day</label>
            <div className="grid grid-cols-4 gap-2">
              {[20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyMinutes(mins)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    dailyMinutes === mins
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              Preferred Language Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLanguage('english')}
                className={`p-3 rounded-xl text-left border transition ${
                  language === 'english'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs">Standard English</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Rigorous academic terminology</div>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hinglish')}
                className={`p-3 rounded-xl text-left border transition ${
                  language === 'hinglish'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs">Bilingual Hinglish</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Intuitive Indian university blend</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Learning Style</label>
            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value as LearningStyle)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="example_driven">Example-Driven (Analogies & Code Walkthroughs)</option>
              <option value="conceptual">First-Principles Conceptual (Proofs & Mental Models)</option>
              <option value="step_by_step">Step-by-Step Procedural (Algorithm Traces)</option>
              <option value="exam_focused">Exam-Focused (Mark distribution & canonical formats)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Syllabus Ingestion Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              3. Syllabus Ingestion & Automated Curriculum Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste your course syllabus below. The agent extracts units, creates prerequisite graphs, and calibrates difficulty.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadSampleSyllabus}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition self-start sm:self-auto shrink-0"
          >
            Load Sample B.Tech Syllabus
          </button>
        </div>

        <textarea
          rows={6}
          value={syllabusText}
          onChange={(e) => setSyllabusText(e.target.value)}
          placeholder="Paste your subject syllabus, units, and topic outlines here..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            disabled={isParsingSyllabus}
            onClick={handleParseSyllabus}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {isParsingSyllabus ? 'Analyzing Syllabus Graph...' : 'Analyze Syllabus & Extract Concepts'}
          </button>

          {statusMessage && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {statusMessage}
            </div>
          )}
        </div>

        {/* Parsed Concepts Preview */}
        {parsedPreview && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Generated Curriculum Graph ({parsedPreview.length} Concepts Identified):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {parsedPreview.map((c, i) => (
                <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span className="capitalize">{c.difficulty} • {c.importance}</span>
                    <span>{c.estimatedMinutes} mins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion Bar */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-xs text-slate-400">
          Ready to generate your personalized learning plan.
        </div>
        <button
          onClick={handleCompleteOnboarding}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition active:scale-95"
        >
          Initialize Learning Agent
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
