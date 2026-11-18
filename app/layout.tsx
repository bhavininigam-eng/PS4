import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'LearnLoop AI | Your Personal AI Tutor That Learns How You Learn',
  description:
    'PS04 Competition Entry for PromptWars x Agent X 2.0. Adaptive AI Learning Agent that detects knowledge gaps, dynamically generates personalized learning paths, and teaches in English and Hinglish.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-[#070a12] py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-300">LearnLoop AI</span> — Problem Statement PS04 (Personalized AI Learning Agent)
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>PromptWars x Agent X 2.0</span>
              <span>•</span>
              <span>B.Tech CSE Undergraduate Persona</span>
              <span>•</span>
              <span className="text-cyan-400">Collaborator: Parth Sharma</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
