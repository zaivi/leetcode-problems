import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Problem } from '../types';
import { getProblemHint, initGemini } from '../services/geminiService';

interface GeminiPanelProps {
  problem: Problem | null;
  onClose: () => void;
  apiKey: string;
}

export const GeminiPanel: React.FC<GeminiPanelProps> = ({ problem, onClose, apiKey }) => {
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (problem && apiKey) {
      fetchHint();
    }
  }, [problem]);

  const fetchHint = async () => {
    if (!problem) return;
    if (!apiKey) {
        setError("Please add your Gemini API Key in Settings.");
        return;
    }

    setLoading(true);
    setError(null);
    setHint(null);
    
    try {
      initGemini(apiKey);
      const result = await getProblemHint(problem.title, problem.difficulty);
      setHint(result);
    } catch (err) {
      setError("Failed to generate hint. Please check your API key or try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!problem) return null;

  return (
    <div className="w-80 border-l border-dark-700 bg-dark-800 flex flex-col h-full shadow-2xl absolute right-0 top-0 bottom-0 z-20">
      <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-900">
        <div className="flex items-center gap-2 text-purple-400 font-semibold">
          <Sparkles size={18} />
          <span>AI Hint</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <h3 className="font-medium text-white mb-1">{problem.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full border mb-4 inline-block
          ${problem.difficulty === 'Easy' ? 'text-green-400 border-green-900 bg-green-900/20' : 
            problem.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-900 bg-yellow-900/20' : 
            'text-red-400 border-red-900 bg-red-900/20'}`}>
          {problem.difficulty}
        </span>

        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <RefreshCw className="animate-spin text-purple-500" size={24} />
              <p className="text-sm text-slate-400">Thinking...</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm flex gap-2 items-start">
               <AlertCircle size={16} className="shrink-0 mt-0.5" />
               <p>{error}</p>
            </div>
          ) : hint ? (
            <div className="prose prose-invert prose-sm">
               <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                 {hint}
               </div>
               <p className="text-xs text-slate-500 mt-2 text-center">
                 AI generated content can be inaccurate.
               </p>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
                Waiting for input...
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-dark-700">
          <button 
             onClick={fetchHint}
             disabled={loading}
             className="w-full py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
              Regenerate Hint
          </button>
      </div>
    </div>
  );
};
