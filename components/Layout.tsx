import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Layout as LayoutIcon, Settings, BarChart2, Github, LogOut, LogIn, User, ListChecks } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface LayoutProps {
  children: React.ReactNode;
  session: Session | null;
  onSignOut: () => void;
  onSignIn: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  session,
  onSignOut,
  onSignIn
}) => {
  return (
    <div className="flex flex-col h-full bg-dark-900 text-slate-200">
      {/* Top Navbar */}
      <header className="h-14 border-b border-dark-700 bg-dark-800 flex items-center justify-between px-4 shrink-0 z-20">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <LayoutIcon size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">LeetTrack <span className="text-primary-500">Pro</span></h1>
        </Link>

        <nav className="flex items-center gap-1 bg-dark-900/50 p-1 rounded-lg border border-dark-700">
          <NavLink
            to="/"
            className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              isActive ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <BarChart2 size={16} />
            Dashboard
          </NavLink>
          <NavLink
            to="/explorer"
            className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              isActive ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <Github size={16} />
            Explorer
          </NavLink>
          <NavLink
            to="/my-problems"
            className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              isActive ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <ListChecks size={16} />
            My Problems
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {/* User Info */}
          {session ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 rounded-lg border border-dark-600">
                <User size={16} className="text-primary-400" />
                <span className="text-sm text-slate-300">{session.user.email}</span>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              title="Sign In"
            >
              <LogIn size={16} />
              <span className="text-sm font-medium">Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
