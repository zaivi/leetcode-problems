import React, { useMemo, useState, useEffect } from 'react';
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

  const handleAddToMyProblems = async (problem: Problem) => {
    setAddingProblem(problem.id);
    try {
      await onAddToMyProblems(problem);
      showAlert(`"${problem.title}" added to My Problems!`, 'success');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        showAlert('Problem already in My Problems.', 'warning');
      } else {
        showAlert('You must be signed in to add problems to My Problems.', 'warning');
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
      <div className="p-4 border-b border-dark-700 flex flex-wrap gap-4 items-center bg-dark-800/50">
        <input
          type="text"
          placeholder="Search by title, ID, or topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-dark-900 border border-dark-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:border-primary-500 outline-none w-64"
        />
        
        <select 
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value as any)}
          className="bg-dark-900 border border-dark-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:border-primary-500 outline-none"
        >
          <option value="All">All Difficulties</option>
          <option value={Difficulty.Easy}>Easy</option>
          <option value={Difficulty.Medium}>Medium</option>
          <option value={Difficulty.Hard}>Hard</option>
        </select>

        <div className="ml-auto text-xs text-slate-500">
          Showing {filteredProblems.length} / {problems.length}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto pb-48">
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

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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