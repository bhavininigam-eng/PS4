import React from 'react';
import { ConceptStatus } from '@/lib/types';
import { CheckCircle2, AlertTriangle, BookOpen, Clock, HelpCircle } from 'lucide-react';

interface MasteryBadgeProps {
  status: ConceptStatus;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const MasteryBadge: React.FC<MasteryBadgeProps> = ({ status, score, size = 'md' }) => {
  const configs: Record<
    ConceptStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    MASTERED: {
      label: 'Mastered',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    },
    LEARNING: {
      label: 'Learning',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: <BookOpen className="w-3.5 h-3.5 text-amber-400" />,
    },
    WEAK: {
      label: 'Weak Concept',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
    },
    REVISION_REQUIRED: {
      label: 'Revision Due',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      icon: <Clock className="w-3.5 h-3.5 text-purple-400" />,
    },
    UNASSESSED: {
      label: 'Untested',
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400" />,
    },
  };

  const c = configs[status] || configs.UNASSESSED;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${c.bg} ${c.text} ${c.border} ${sizeClasses}`}
    >
      {c.icon}
      <span>{c.label}</span>
      {score !== undefined && (
        <span className="font-bold opacity-90 ml-0.5">({Math.round(score)}%)</span>
      )}
    </span>
  );
};
