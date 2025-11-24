import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ProgressMap, Status, UserProgress } from '../types';
import { CheckCircle2, Circle, Clock, RotateCcw, Trophy } from 'lucide-react';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
  progressMap: ProgressMap;
  totalProblemsSeen: number; // Just a rough count of problems loaded in session to show context
}

export const Dashboard: React.FC<DashboardProps> = ({ progressMap, totalProblemsSeen }) => {
  
  const stats = (Object.values(progressMap) as UserProgress[]).reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  const notStartedCount = stats[Status.NotStarted] || 0;
  const todoCount = stats[Status.Todo] || 0;
  const solvingCount = stats[Status.Solving] || 0;
  const solvedCount = stats[Status.Solved] || 0;
  const reviseCount = stats[Status.Revise] || 0;
  const totalTracked = notStartedCount + todoCount + solvingCount + solvedCount + reviseCount;

  // Prepare data for Chart.js
  const statusData = [
    { label: 'Solved', value: solvedCount, color: '#10b981' }, // Emerald 500
    { label: 'Solving', value: solvingCount, color: '#f59e0b' }, // Amber 500
    { label: 'Revise', value: reviseCount, color: '#f43f5e' }, // Rose 500
    { label: 'Todo', value: todoCount, color: '#3b82f6' }, // Blue 500
    { label: 'Not Started', value: notStartedCount, color: '#64748b' }, // Slate 500
  ].filter(d => d.value > 0);

  const chartData = {
    labels: statusData.map(d => d.label),
    datasets: [
      {
        data: statusData.map(d => d.value),
        backgroundColor: statusData.map(d => d.color),
        borderColor: '#1e293b',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll use custom legend
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  // Activity Mock Data (Last 7 days) - In a real app, we'd calculate this from lastUpdated timestamp
  // For now, we simulate "Tasks by Status"
  
  return (
    <div className="h-full overflow-y-auto p-6 bg-dark-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header>
          <h2 className="text-2xl font-bold text-white mb-1">Your Progress</h2>
          <p className="text-slate-400">Overview of your LeetCode journey across tracked companies.</p>
        </header>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard 
            title="Solved" 
            value={solvedCount} 
            icon={<CheckCircle2 className="text-emerald-500" size={24} />} 
            borderColor="border-emerald-500/30"
            bgColor="bg-emerald-500/5"
          />
          <StatCard 
            title="In Progress" 
            value={solvingCount} 
            icon={<Clock className="text-amber-500" size={24} />} 
            borderColor="border-amber-500/30"
            bgColor="bg-amber-500/5"
          />
          <StatCard 
            title="To Revise" 
            value={reviseCount} 
            icon={<RotateCcw className="text-rose-500" size={24} />} 
            borderColor="border-rose-500/30"
            bgColor="bg-rose-500/5"
          />
          <StatCard 
            title="Todo" 
            value={todoCount} 
            icon={<Circle className="text-blue-500" size={24} />} 
            borderColor="border-blue-500/30"
            bgColor="bg-blue-500/5"
          />
          <StatCard 
            title="Not Started" 
            value={notStartedCount} 
            icon={<Circle className="text-slate-500" size={24} />} 
            borderColor="border-slate-500/30"
            bgColor="bg-slate-500/5"
          />
          <StatCard 
            title="Total Tracked" 
            value={totalTracked} 
            icon={<Trophy className="text-primary-500" size={24} />} 
            borderColor="border-primary-500/30"
            bgColor="bg-primary-500/5"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg text-slate-200 mb-4">Status Distribution</h3>
            <div className="h-64 w-full flex items-center justify-center">
              {statusData.length > 0 ? (
                <div className="w-full h-full max-w-md mx-auto">
                  <Pie data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No data yet. Start tracking problems!
                </div>
              )}
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusData.map(item => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                  <span className="text-slate-400">({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-sm flex flex-col">
            <h3 className="font-semibold text-lg text-slate-200 mb-4">Quick Tips</h3>
            <div className="flex-1 space-y-4 text-sm text-slate-400">
              <div className="p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                <strong className="text-slate-200 block mb-1">Company Tags</strong>
                Focus on the "Six Months" or "All" lists for specific companies if you have an interview coming up.
              </div>
              <div className="p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                <strong className="text-slate-200 block mb-1">Spaced Repetition</strong>
                Mark problems as <span className="text-purple-400">Revise</span> if you struggled. Revisit them after 3 days.
              </div>
              <div className="p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                 <strong className="text-slate-200 block mb-1">AI Assistance</strong>
                 Use the magic wand icon in the explorer to get a conceptual hint without spoiling the code.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; borderColor: string; bgColor: string }> = ({ 
  title, value, icon, borderColor, bgColor 
}) => {
  return (
    <div className={`p-4 rounded-xl border ${borderColor} ${bgColor} flex items-center justify-between`}>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{title}</p>
        <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
      </div>
      <div className="opacity-80">
        {icon}
      </div>
    </div>
  );
};