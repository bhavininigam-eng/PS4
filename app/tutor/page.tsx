'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Send,
  Languages,
  BookOpen,
  MessageSquare,
  Bot,
  User,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getKnowledgeMap, getProfile, subscribeToStore } from '@/lib/store';
import { TeachingExplanation, LanguagePreference, ChatMessage, Concept } from '@/lib/types';
import { ExplanationCard } from '@/components/ExplanationCard';
import { MasteryBadge } from '@/components/MasteryBadge';

function TutorContent() {
  const searchParams = useSearchParams();
  const urlConcept = searchParams.get('concept');

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConceptName, setSelectedConceptName] = useState<string>('Functions and Modular Decomposition');
  const [language, setLanguage] = useState<LanguagePreference>('hinglish');
  const [explanation, setExplanation] = useState<TeachingExplanation | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Interactive Follow-up Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  useEffect(() => {
    const kmap = getKnowledgeMap();
    const prof = getProfile();
    const list = Object.values(kmap.concepts);
    setConcepts(list);

    if (prof) {
      setLanguage(prof.preferredLanguage || 'hinglish');
    }

    if (urlConcept) {
      setSelectedConceptName(decodeURIComponent(urlConcept));
    } else if (list.length > 0) {
      const weakConcept = list.find((c) => c.status === 'WEAK');
      setSelectedConceptName(weakConcept ? weakConcept.name : list[0].name);
    }
  }, [urlConcept]);

  // Fetch or regenerate explanation when selected concept or language changes
  useEffect(() => {
    if (!selectedConceptName) return;

    let isCancelled = false;
    setIsLoadingExplanation(true);

    const currentConceptObj = concepts.find(
      (c) => c.name.toLowerCase() === selectedConceptName.toLowerCase()
    );

    fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Teach me ${selectedConceptName}`,
        conceptContext: selectedConceptName,
        language,
        layer: 'conceptual',
        masteryScore: currentConceptObj?.masteryScore ?? 40,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.explanation) {
          setExplanation(data.explanation);
        }
      })
      .catch((err) => {
        console.error('Explanation fetch error:', err);
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingExplanation(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedConceptName, language, concepts]);

  // Handle follow up chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSendingChat) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setIsSendingChat(true);

    try {
      const currentConceptObj = concepts.find(
        (c) => c.name.toLowerCase() === selectedConceptName.toLowerCase()
      );

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conceptContext: selectedConceptName,
          language,
          layer: 'conceptual',
          masteryScore: currentConceptObj?.masteryScore ?? 40,
        }),
      });

      const data = await res.json();
      if (data.success && data.explanation) {
        // Build responsive tutor reply grounded in context
        const replyContent =
          language === 'hinglish'
            ? `💡 **${selectedConceptName} Doubt Resolution:**\n\n${data.explanation.beginnerELI5}\n\n**Example:** ${data.explanation.realWorldExample}\n\n**Caution:** ${data.explanation.commonMistakes[0] || 'Edge case assumptions ko double-check karein.'}`
            : `💡 **${selectedConceptName} Analysis:**\n\n${data.explanation.conceptual}\n\n**Production Context:** ${data.explanation.realWorldExample}\n\n**Avoid this common pitfall:** ${data.explanation.commonMistakes[0] || 'Be cautious with boundary indices.'}`;

        const newAssistantMsg: ChatMessage = {
          id: `msg-resp-${Date.now()}`,
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFallback: data.isFallback,
        };

        setChatMessages((prev) => [...prev, newAssistantMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const activeConcept = concepts.find(
    (c) => c.name.toLowerCase() === selectedConceptName.toLowerCase()
  );

  return (
    <div className="space-y-8 py-4">
      {/* Header & Concept Selector */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Feature 4: Multi-Layer AI Teaching Assistant
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">AI University Tutor</h1>
          <p className="text-sm text-slate-400 mt-1">
            Explanations adapt to your current knowledge map. Choose any concept to explore all 7 pedagogical layers.
          </p>
        </div>

        {/* Concept Selector Dropdown */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedConceptName}
              onChange={(e) => setSelectedConceptName(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none max-w-[220px]"
            >
              {concepts.map((c) => (
                <option key={c.id} value={c.name} className="bg-slate-900 text-white">
                  {c.name} ({c.masteryScore}%)
                </option>
              ))}
            </select>
          </div>

          {activeConcept && (
            <MasteryBadge status={activeConcept.status} score={activeConcept.masteryScore} />
          )}
        </div>
      </div>

      {/* Main Multi-Layer Explanation Card */}
      {explanation ? (
        <ExplanationCard
          explanation={explanation}
          onLanguageToggle={(lang) => setLanguage(lang)}
          isLoading={isLoadingExplanation}
        />
      ) : (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading personalized lesson...</p>
        </div>
      )}

      {/* Interactive Doubt Resolution Chat Interface */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Ask Follow-Up Doubts to Your Tutor</h3>
          </div>
          <span className="text-xs text-slate-400">
            Topic Context: <span className="text-indigo-300 font-medium">{selectedConceptName}</span>
          </span>
        </div>

        {/* Chat Log */}
        <div className="min-h-[160px] max-h-[360px] overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
          {chatMessages.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Have questions about {selectedConceptName}? Ask in English or Hinglish below!
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-cyan-300" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-cyan-300" />
                  </div>
                )}
              </div>
            ))
          )}

          {isSendingChat && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Tutor is formulating response...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask a doubt about ${selectedConceptName} (e.g. "Can you give me another exam example?")`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSendingChat}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-400">Loading AI Tutor...</p>
        </div>
      }
    >
      <TutorContent />
    </Suspense>
  );
}
