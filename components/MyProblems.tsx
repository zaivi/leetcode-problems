import React, { useState, useMemo } from 'react';
import { ExternalLink, Trash2, CheckCircle2, Circle, Clock, RotateCcw } from 'lucide-react';
import { PersonalProblem, Difficulty, Status } from '../types';
import { Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface MyProblemsProps {
  problems: PersonalProblem[];
  progressMap: { [id: string]: { status: Status; remarks: string } };
  onDelete: (id: number) => void;
  onStatusChange: (id: string, status: Status) => void;
  onRemarkChange: (id: string, remarks: string) => void;
}

export const MyProblems: React.FC<MyProblemsProps> = ({
  problems,
  progressMap,
  onDelete,
  onStatusChange,
  onRemarkChange,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    problemId: number | null;
    problemTitle: string;
  }>({
    open: false,
    problemId: null,
    problemTitle: '',
  });
  
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const showAlert = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setAlert({ open: true, message, severity });
  };

  const handleDelete = (id: number, title: string) => {
    setDeleteDialog({
      open: true,
      problemId: id,
      problemTitle: title,
    });
  };

  const confirmDelete = async () => {
    if (deleteDialog.problemId) {
      try {
        await onDelete(deleteDialog.problemId);
        showAlert('Problem deleted successfully!', 'success');
      } catch (error) {
        showAlert('Failed to delete problem', 'error');
      }
    }
    setDeleteDialog({ open: false, problemId: null, problemTitle: '' });
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, problemId: null, problemTitle: '' });
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const userState = progressMap[p.id.toString()]?.status || Status.NotStarted;
      
      const matchesDiff = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
      const matchesStatus = filterStatus === 'All' || userState === filterStatus;
      const matchesSearch =
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.topics?.toLowerCase().includes(search.toLowerCase());

      return matchesDiff && matchesStatus && matchesSearch;
    });
  }, [problems, progressMap, filterDifficulty, filterStatus, search]);

  const getDifficultyColor = (d: string | null) => {
    switch (d) {
      case 'Easy':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Hard':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (s: Status) => {
    switch (s) {
      case Status.Solved:
        return <CheckCircle2 size={16} className="text-green-500" />;
      case Status.Solving:
        return <Clock size={16} className="text-yellow-500" />;
      case Status.Revise:
        return <RotateCcw size={16} className="text-purple-500" />;
      case Status.NotStarted:
        return <Circle size={16} style={{color: '#7030A1'}} />;
      default:
        return <Circle size={16} className="text-slate-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900">
      {/* Filters Toolbar */}
      <div className="p-4 border-b border-dark-700 flex flex-wrap gap-4 items-center bg-dark-800/50">
        <input
          type="text"
          placeholder="Search problems or topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-dark-900 border border-dark-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:border-primary-500 outline-none w-64"
        />

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="bg-dark-900 border border-dark-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:border-primary-500 outline-none"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-dark-900 border border-dark-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:border-primary-500 outline-none"
        >
          <option value="All">All Statuses</option>
          <option value={Status.NotStarted.toString()}>Not Started</option>
          <option value={Status.Todo.toString()}>Todo</option>
          <option value={Status.Solving.toString()}>Solving</option>
          <option value={Status.Solved.toString()}>Solved</option>
          <option value={Status.Revise.toString()}>Revise</option>
        </select>

        <div className="ml-auto text-xs text-slate-500">
          Showing {filteredProblems.length} / {problems.length}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        {problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p className="text-lg mb-2">No problems added yet</p>
            <p className="text-sm">Go to Explorer tab to add problems to track</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-dark-800 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">
                  Status
                </th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                  Company
                </th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-48">
                  Title
                </th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">
                  Difficulty
                </th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-48">
                  Topics
                </th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                  Created At
                </th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-64">
                  Remark
                </th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredProblems.map((problem) => {
                const progress = progressMap[problem.id.toString()] || {
                  status: Status.NotStarted,
                  remarks: '',
                };
                return (
                  <tr
                    key={problem.id}
                    className="hover:bg-dark-800/50 transition-colors group"
                  >
                    <td className="p-3">
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() =>
                            setOpenDropdownId(openDropdownId === problem.id ? null : problem.id)
                          }
                          className="p-1 rounded hover:bg-dark-700 transition-colors"
                        >
                          {getStatusIcon(progress.status)}
                        </button>

                        {openDropdownId === problem.id && (
                          <div className="absolute left-0 top-full mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 p-1 w-32">
                            {Object.values(Status).map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  onStatusChange(problem.id.toString(), s);
                                  setOpenDropdownId(null);
                                }}
                                className={`w-full text-left px-2 py-2 text-xs rounded hover:bg-dark-700 flex items-center gap-2 ${
                                  progress.status === s
                                    ? 'text-primary-400 bg-primary-500/10'
                                    : 'text-slate-300'
                                }`}
                              >
                                {getStatusIcon(s)} {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-300 text-sm">{problem.company || 'N/A'}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={problem.link || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-200 hover:text-primary-400 font-medium transition-colors"
                        >
                          {problem.title}
                        </a>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty || 'Unknown'}
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
                    <td className="p-3">
                      <span className="text-slate-400 text-xs whitespace-nowrap">
                        {new Date(problem.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Bangkok'
                        })}
                      </span>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={progress.remarks || ''}
                        onChange={(e) => onRemarkChange(problem.id.toString(), e.target.value)}
                        placeholder="Add note..."
                        className="bg-transparent border-b border-transparent hover:border-dark-600 focus:border-primary-500 outline-none text-sm text-slate-300 w-full placeholder-slate-600"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(problem.id, problem.title || 'this problem')}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                          title="Delete Problem"
                        >
                          <Trash2 size={14} />
                        </button>
                        <a
                          href={problem.link || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-600 rounded"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {filteredProblems.length === 0 && problems.length > 0 && (
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={cancelDelete}
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            borderRadius: 2,
            border: '1px solid #334155',
          },
        }}
      >
        <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 600 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#cbd5e1' }}>
            Are you sure you want to delete "{deleteDialog.problemTitle}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={cancelDelete}
            sx={{
              color: '#94a3b8',
              '&:hover': {
                bgcolor: 'rgba(148, 163, 184, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            sx={{
              bgcolor: '#ef4444',
              '&:hover': {
                bgcolor: '#dc2626',
              },
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

