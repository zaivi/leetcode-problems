import React, { useMemo, useState } from 'react';
import { ExternalLink, Sparkles, Plus } from 'lucide-react';
import { Problem, Difficulty } from '../types';
import { Alert, Snackbar } from '@mui/material';

interface ProblemTableProps {
  problems: Problem[];
  onAskAI: (problem: Problem) => void;
  onAddToMyProblems: (problem: Problem) => Promise<void>;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({ 
  problems, 
  onAskAI,
  onAddToMyProblems
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'All'>('All');
  const [search, setSearch] = useState('');
  const [addingProblem, setAddingProblem] = useState<string | null>(null);
  
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showAlert = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setAlert({ open: true, message, severity });
  };

  const showSuccessToast = (message: string) => {
    // Create toast element directly in DOM - won't be affected by React re-renders
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 40px;
      right: 24px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #1e293b;
      padding: 14px 20px;
      border-radius: 12px;
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.08),
        0 8px 32px rgba(0, 0, 0, 0.06),
        inset 0 0 0 1px rgba(16, 185, 129, 0.2);
      z-index: 99999;
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: gentleSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 380px;
      line-height: 1.4;
    `;
    
    // Add checkmark icon
    const icon = document.createElement('span');
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="10" fill="#10b981" fill-opacity="0.15"/>
        <path d="M6 10L8.5 12.5L14 7" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    icon.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      animation: checkPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards;
    `;
    
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    textSpan.style.cssText = `
      color: #334155;
      font-weight: 500;
    `;
    
    toast.appendChild(icon);
    toast.appendChild(textSpan);
    
    // Add animation keyframes if not already added
    if (!document.getElementById('toast-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-animation-styles';
      style.textContent = `
        @keyframes gentleSlideIn {
          from {
            transform: translateY(10px) translateX(20px);
            opacity: 0;
            scale: 0.95;
          }
          to {
            transform: translateY(0) translateX(0);
            opacity: 1;
            scale: 1;
          }
        }
        @keyframes gentleSlideOut {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(-8px) scale(0.98);
            opacity: 0;
          }
        }
        @keyframes checkPop {
          from {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'gentleSlideOut 0.35s cubic-bezier(0.4, 0, 1, 1)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 350);
    }, 3000);
  };

  const handleAddToMyProblems = async (problem: Problem) => {
    setAddingProblem(problem.id);
    try {
      await onAddToMyProblems(problem);
      showSuccessToast(`"${problem.title}" added to My Problems!`);
    } catch (error: any) {
      console.error('Error adding problem to My Problems:', error);
      if (error.message?.includes('already exists')) {
        showAlert('Problem already in My Problems.', 'warning');
      } else {
        showAlert(error.message || 'Failed to add problem. Please try again.', 'error');
      }
    } finally {
      setAddingProblem(null);
    }
  };

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesDiff = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                           p.id.includes(search) ||
                           (p.topics?.toLowerCase().includes(search.toLowerCase()) || false);

      return matchesDiff && matchesSearch;
    });
  }, [problems, filterDifficulty, search]);

  const getDifficultyColor = (d: Difficulty) => {
    switch (d) {
      case Difficulty.Easy: return 'text-green-400 bg-green-400/10 border-green-400/20';
      case Difficulty.Medium: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case Difficulty.Hard: return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900">
      {/* Filters Toolbar */}
      <div className="p-3 sm:p-4 border-b border-dark-700 flex flex-wrap gap-2 sm:gap-4 items-center bg-dark-800/50">
        <input
          type="text"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-dark-900 border border-dark-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:border-primary-500 outline-none w-full sm:w-64"
        />
        
        <select 
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value as any)}
          className="bg-dark-900 border border-dark-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:border-primary-500 outline-none flex-1 sm:flex-initial"
        >
          <option value="All">All Difficulties</option>
          <option value={Difficulty.Easy}>Easy</option>
          <option value={Difficulty.Medium}>Medium</option>
          <option value={Difficulty.Hard}>Hard</option>
        </select>

        <div className="w-full sm:w-auto sm:ml-auto text-xs text-slate-500 text-center sm:text-right">
          Showing {filteredProblems.length} / {problems.length}
        </div>
      </div>

      {/* Desktop Table Content */}
      <div className="hidden lg:block flex-1 overflow-auto pb-48">
        <table className="w-full text-left border-collapse">
          <thead className="bg-dark-800 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">ID</th>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">Difficulty</th>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Topics</th>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">Acceptance</th>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">Frequency</th>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {filteredProblems.map((problem) => {
              return (
                <tr key={problem.id} className="hover:bg-dark-800/50 transition-colors group">
                  <td className="p-3 text-slate-500 font-mono text-sm">{problem.id}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <a 
                        href={problem.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-slate-200 hover:text-primary-400 font-medium transition-colors line-clamp-1"
                      >
                        {problem.title}
                      </a>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {problem.topics ? (
                        problem.topics.split(',').map((topic, idx) => (
                          <span 
                            key={idx} 
                            className="text-xs px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20"
                          >
                            {topic.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 text-sm">{problem.acceptance}</td>
                  <td className="p-3 text-slate-400 text-sm">{problem.frequency}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleAddToMyProblems(problem)}
                        disabled={addingProblem === problem.id}
                        className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Add to My Problems"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        onClick={() => onAskAI(problem)}
                        className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 rounded"
                        title="Get Hint from AI"
                      >
                        <Sparkles size={14} />
                      </button>
                      <a href={problem.url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-600 rounded">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredProblems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <p>No problems match your filters.</p>
            </div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden flex-1 overflow-auto p-3 space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <p>No problems match your filters.</p>
          </div>
        ) : (
          filteredProblems.map((problem) => (
            <div 
              key={problem.id} 
              className="bg-dark-800 border border-dark-700 rounded-lg p-4 space-y-3"
            >
              {/* Header: ID and Difficulty */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-mono text-xs">#{problem.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-slate-200 font-medium text-sm leading-tight">
                {problem.title}
              </h3>

              {/* Topics */}
              {problem.topics && (
                <div className="flex flex-wrap gap-1">
                  {problem.topics.split(',').slice(0, 3).map((topic, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20"
                    >
                      {topic.trim()}
                    </span>
                  ))}
                  {problem.topics.split(',').length > 3 && (
                    <span className="text-xs px-2 py-0.5 text-slate-500">
                      +{problem.topics.split(',').length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Acceptance: {problem.acceptance}</span>
                <span>Frequency: {problem.frequency}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-dark-700">
                <button 
                  onClick={() => handleAddToMyProblems(problem)}
                  disabled={addingProblem === problem.id}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded disabled:cursor-not-allowed transition-all ${
                    'text-green-400 hover:text-green-300 bg-green-400/10 hover:bg-green-400/20 disabled:opacity-50'
                  }`}
                  title="Add to My Problems"
                >
                  <Plus size={16} />
                  <span className="text-xs font-medium">Add</span>
                </button>
                <button 
                  onClick={() => onAskAI(problem)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-purple-400 hover:text-purple-300 bg-purple-400/10 hover:bg-purple-400/20 rounded transition-colors"
                  title="Get Hint from AI"
                >
                  <Sparkles size={16} />
                  <span className="text-xs font-medium">Hint</span>
                </button>
                <a 
                  href={problem.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center p-2 text-slate-400 hover:text-white bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: 9999, marginTop: '40px', marginRight: '24px' }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};