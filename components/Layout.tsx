import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Layout as LayoutIcon, Settings, BarChart2, Github, LogOut, LogIn, User, ListChecks, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-dark-900 text-slate-200">
      {/* Top Navbar */}
      <header className="h-14 border-b border-dark-700 bg-dark-800 flex items-center justify-between px-4 shrink-0 z-20">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <LayoutIcon size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
            LeetTrack <span className="text-primary-500">Pro</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-dark-900/50 p-1 rounded-lg border border-dark-700">
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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop User Info */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 rounded-lg border border-dark-600">
                <User size={16} className="text-primary-400" />
                <span className="text-sm text-slate-300 max-w-[150px] lg:max-w-none truncate">
                  {session.user.email}
                </span>
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-800 border-b border-dark-700 z-30">
          <nav className="flex flex-col p-2">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `px-4 py-3 rounded-md text-sm font-medium transition-all flex items-center gap-3 ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <BarChart2 size={18} />
              Dashboard
            </NavLink>
            <NavLink
              to="/explorer"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `px-4 py-3 rounded-md text-sm font-medium transition-all flex items-center gap-3 ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Github size={18} />
              Explorer
            </NavLink>
            <NavLink
              to="/my-problems"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `px-4 py-3 rounded-md text-sm font-medium transition-all flex items-center gap-3 ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <ListChecks size={18} />
              My Problems
            </NavLink>
          </nav>
          
          {/* Mobile User Info */}
          <div className="p-4 border-t border-dark-700">
            {session ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg border border-dark-600">
                  <User size={16} className="text-primary-400" />
                  <span className="text-sm text-slate-300 truncate">
                    {session.user.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onSignIn();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <LogIn size={16} />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="h-8 border-t border-dark-700 bg-dark-800 flex items-center justify-center px-4 shrink-0 z-20">
        <span className="text-xs text-slate-500">
          {process.env.LEETTRACK_VERSION || 'v0.0.0'}
        </span>
      </footer>
    </div>
  );
};
