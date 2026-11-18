'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  LayoutDashboard,
  FileSpreadsheet,
  GitFork,
  MapPin,
  Sparkles,
  Award,
  Clock,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  X,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import { getProfile, loadDemoExperience, resetToBlankStudent, subscribeToStore } from '@/lib/store';
import { StudentProfile } from '@/lib/types';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLiveAI, setIsLiveAI] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setProfile(getProfile());
    const unsub = subscribeToStore(() => {
      setProfile(getProfile());
    });

    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        setIsLiveAI(data.isLiveAI);
      })
      .catch(() => setIsLiveAI(false));

    return () => unsub();
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/onboarding', label: 'Onboarding & Syllabus', icon: FileSpreadsheet },
    { href: '/knowledge-map', label: 'Knowledge Map', icon: GitFork },
    { href: '/roadmap', label: 'Learning Path', icon: MapPin },
    { href: '/tutor', label: 'AI Tutor', icon: Sparkles },
    { href: '/diagnostic', label: 'Diagnostic Test', icon: HelpCircle },
    { href: '/assessment', label: 'Assessment Arena', icon: Award },
    { href: '/revision', label: 'Revision Centre', icon: Clock },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0b1120] rounded-[10px] flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  LearnLoop <span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">
                  PS04 • Personalized AI Learning Agent
                </span>
              </div>
            </Link>

            {/* AI Engine Status Badge */}
            <div className="hidden md:flex items-center ml-4">
              {isLiveAI ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Gemini AI
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30" title="Deterministic Pedagogical Engine Active (Zero API key required for full demo)">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Deterministic AI Engine (Demo Mode)
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 7).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Student Status & Demo Controller */}
          <div className="flex items-center gap-2">
            {profile && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-lg text-xs">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-medium truncate max-w-[120px]">
                  {profile.displayName}
                </span>
                {profile.isDemoStudent && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                    DEMO
                  </span>
                )}
              </div>
            )}

            <button
              onClick={() => {
                if (profile?.isDemoStudent) {
                  resetToBlankStudent('Web Engineering');
                } else {
                  loadDemoExperience();
                }
              }}
              title="Toggle between Alex Sharma (Pre-loaded Demo) and New Learner"
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">
                {profile?.isDemoStudent ? 'Switch to New Student' : 'Load Demo Data'}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#090d16] px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 mb-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Current AI Mode:</span>
            <span className="text-xs font-semibold text-cyan-400">
              {isLiveAI ? 'Live Gemini AI' : 'Deterministic Engine'}
            </span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
