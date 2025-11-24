import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
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

  // Prepare data for Chart.js with enhanced colors
  const statusData = [
    { label: 'Solved', value: solvedCount, color: '#10b981' }, // Emerald 500
    { label: 'Solving', value: solvingCount, color: '#f59e0b' }, // Amber 500
    { label: 'Todo', value: todoCount, color: '#3b82f6' }, // Blue 500
    { label: 'Revise', value: reviseCount, color: '#ec4899' }, // Pink 500
    { label: 'Not Started', value: notStartedCount, color: '#8b5cf6' }, // Violet 500
  ].filter(d => d.value > 0);

  const chartData = {
    labels: statusData.map(d => d.label),
    datasets: [
      {
        data: statusData.map(d => d.value),
        backgroundColor: statusData.map(d => d.color),
        borderColor: '#0f172a',
        borderWidth: 3,
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 3,
        hoverOffset: 8,
        spacing: 2,
      },
    ],
  };

  // Plugin to draw text in the center of the donut
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart: any) => {
      const { ctx, chartArea: { width, height } } = chart;
      ctx.save();
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Draw total number
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(totalTracked.toString(), centerX, centerY - 10);
      
      // Draw label
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Problems', centerX, centerY + 20);
      
      ctx.restore();
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // Creates the donut effect
    plugins: {
      legend: {
        display: false, // We'll use custom legend
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
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
      centerText: true,
    },
  };

  // Activity Mock Data (Last 7 days) - In a real app, we'd calculate this from lastUpdated timestamp
  // For now, we simulate "Tasks by Status"
  
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 bg-dark-900">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        
        <header>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Your Progress</h2>
          <p className="text-sm sm:text-base text-slate-400">Overview of your LeetCode journey across tracked companies.</p>
        </header>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
            icon={<Circle style={{color: '#7030A1'}} size={24} />} 
            borderColor="border-[#7030A1]/30"
            bgColor="bg-[#7030A1]/5"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Status Distribution */}
          <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-xl p-4 sm:p-6 shadow-lg">
            <h3 className="font-semibold text-base sm:text-lg text-slate-200 mb-6">Status Distribution</h3>
            <div className="h-56 sm:h-72 w-full flex items-center justify-center mb-6">
              {statusData.length > 0 ? (
                <div className="w-full h-full max-w-sm mx-auto relative">
                  <Doughnut data={chartData} options={chartOptions} plugins={[centerTextPlugin]} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No data yet. Start tracking problems!
                </div>
              )}
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {statusData.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 group hover:text-white transition-colors">
                  <div 
                    className="w-3 h-3 rounded-full shadow-lg group-hover:scale-110 transition-transform" 
                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}40` }} 
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col">
            <h3 className="font-semibold text-base sm:text-lg text-slate-200 mb-4">Quick Tips</h3>
            <div className="flex-1 space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-400">
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
    <div className={`p-3 sm:p-4 rounded-xl border ${borderColor} ${bgColor} flex items-center justify-between`}>
      <div className="min-w-0 flex-1">
        <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">{value}</p>
      </div>
      <div className="opacity-80 ml-2">
        <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};