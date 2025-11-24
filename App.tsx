import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CompanySidebar } from './components/CompanySidebar';
import { ProblemTable } from './components/ProblemTable';
import { Dashboard } from './components/Dashboard';
import { GeminiPanel } from './components/GeminiPanel';
import { Auth } from './components/Auth';
import { MyProblems } from './components/MyProblems';

import { Company, Problem, ProblemFile, ProgressMap, Status, PersonalProblem, PersonalProblemInput } from './types';
import { fetchCompanies, fetchCompanyFiles, fetchAndParseCSV } from './services/githubService';
import { loadProgress, updateProblemProgress, syncLocalProgressToSupabase } from './services/storageService';
import { onAuthStateChange, signOut } from './services/authService';
import { fetchPersonalProblems, addPersonalProblem, updatePersonalProblem, deletePersonalProblem, checkProblemExists } from './services/personalProblemsService';
import type { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  // Authentication State
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // Navigation State
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  
  // Data State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [files, setFiles] = useState<ProblemFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProblemFile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeAIProblem, setActiveAIProblem] = useState<Problem | null>(null);
  const [personalProblems, setPersonalProblems] = useState<PersonalProblem[]>([]);

  // Loading State
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User Progress (keyed by problem id)
  const [progress, setProgress] = useState<ProgressMap>({});
  const [myProblemsProgress, setMyProblemsProgress] = useState<{ [id: string]: { status: Status; remarks: string } }>({});

  // Authentication Listener
  useEffect(() => {
    const subscription = onAuthStateChange(async (newSession) => {
      setSession(newSession);
      setIsAuthenticating(false);

      // If user just logged in, sync local progress to Supabase
      if (newSession?.user) {
        await syncLocalProgressToSupabase(newSession.user.id);
        // Reload progress from Supabase
        const userProgress = await loadProgress(newSession.user.id);
        setProgress(userProgress);
      } else {
        // Load from localStorage if not authenticated
        const localProgress = await loadProgress();
        setProgress(localProgress);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Get current route location
  const location = useLocation();

  // Initial Load - Only load progress (used by Dashboard)
  useEffect(() => {
    const init = async () => {
      // Load progress based on auth state
      const userId = session?.user?.id;
      const userProgress = await loadProgress(userId);
      setProgress(userProgress);
    };
    
    if (!isAuthenticating) {
      init();
    }
  }, [isAuthenticating, session]);

  // Lazy load data based on current route
  useEffect(() => {
    const loadRouteData = async () => {
      const userId = session?.user?.id;

      // Reload progress data when on dashboard (/) route
      if (location.pathname === '/') {
        const userProgress = await loadProgress(userId);
        setProgress(userProgress);
      }

      // Load companies data only when on /explorer route
      if (location.pathname === '/explorer' && companies.length === 0) {
        setLoadingCompanies(true);
        try {
          const companyList = await fetchCompanies();
          setCompanies(companyList);
        } catch (e) {
          setError("Failed to load companies. GitHub API rate limit might be exceeded.");
        } finally {
          setLoadingCompanies(false);
        }
      }

      // Load personal problems only when on /my-problems route and user is authenticated
      if (location.pathname === '/my-problems' && userId && personalProblems.length === 0) {
        try {
          const personalProbs = await fetchPersonalProblems();
          setPersonalProblems(personalProbs);
          
          // Load progress for personal problems (keyed by id)
          const myProblemsProgressMap: { [id: string]: { status: Status; remarks: string } } = {};
          personalProbs.forEach(prob => {
            myProblemsProgressMap[prob.id.toString()] = {
              status: (prob.status as Status) || Status.NotStarted,
              remarks: prob.remarks || ''
            };
          });
          setMyProblemsProgress(myProblemsProgressMap);
        } catch (e) {
          console.error('Failed to load personal problems:', e);
        }
      }
    };

    if (!isAuthenticating) {
      loadRouteData();
    }
  }, [location.pathname, isAuthenticating, session, companies.length, personalProblems.length]);

  // Handle Company Selection
  const handleSelectCompany = async (company: Company) => {
    setSelectedCompany(company);
    setFiles([]);
    setProblems([]);
    setSelectedFile(null);
    setLoadingFiles(true);
    setError(null);

    try {
      const fileList = await fetchCompanyFiles(company.path);
      setFiles(fileList);
      
      // Auto-select "All.csv" if available, or the first one
      const allFile = fileList.find(f => f.name.includes('All')) || fileList[0];
      if (allFile) {
        handleSelectFile(allFile, company.name);
      }
    } catch (e) {
      setError("Failed to load files for this company.");
    } finally {
      setLoadingFiles(false);
    }
  };

  // Handle File Selection (Time Period)
  const handleSelectFile = async (file: ProblemFile, companyName: string) => {
    setSelectedFile(file);
    setLoadingProblems(true);
    setError(null);
    try {
      const parsedProblems = await fetchAndParseCSV(file.download_url, companyName);
      setProblems(parsedProblems);
    } catch (e) {
      setError("Failed to load problem data.");
    } finally {
      setLoadingProblems(false);
    }
  };

  // My Problems Progress Updates
  const handleMyProblemsStatusChange = async (id: string, status: Status) => {
    const userId = session?.user?.id;
    
    if (!userId) {
      console.error('No user session when trying to update status');
      throw new Error('You must be signed in to update problem status');
    }

    try {
      // Update the personal_problems table directly
      // Convert Status enum to string value
      const updated = await updatePersonalProblem(parseInt(id), { 
        status: status as any // The enum value will be the string
      });
      
      // Update local state
      setMyProblemsProgress({
        ...myProblemsProgress,
        [id]: { ...myProblemsProgress[id], status }
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  };

  const handleMyProblemsRemarkChange = async (id: string, remarks: string) => {
    const userId = session?.user?.id;
    
    if (!userId) {
      console.error('No user session when trying to update remarks');
      throw new Error('You must be signed in to update problem remarks');
    }

    try {
      // Update the personal_problems table directly
      const updated = await updatePersonalProblem(parseInt(id), { remarks });
      
      // Update local state
      setMyProblemsProgress({
        ...myProblemsProgress,
        [id]: { ...myProblemsProgress[id], remarks }
      });
    } catch (error) {
      console.error('Failed to update remarks:', error);
      throw error;
    }
  };

  // Add Problem to My Problems
  const handleAddToMyProblems = async (problem: Problem) => {
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error('You must be signed in to add problems to My Problems');
    }

    // Check if problem already exists (RLS will filter by current user)
    const exists = await checkProblemExists(problem.title);
    if (exists) {
      throw new Error('Problem already exists in My Problems');
    }

    // Include user_id explicitly for proper RLS
    const personalProblem: PersonalProblemInput = {
      difficulty: problem.difficulty,
      title: problem.title,
      link: problem.url,
      topics: problem.topics || '',
      company: problem.company || '',
      user_id: userId,
      status: Status.NotStarted
    };

    await addPersonalProblem(personalProblem);
    
    // Refetch all problems with proper sorting (created_at descending)
    const updatedProblems = await fetchPersonalProblems();
    setPersonalProblems(updatedProblems);
    
    // Update progress map for all problems
    const myProblemsProgressMap: { [id: string]: { status: Status; remarks: string } } = {};
    updatedProblems.forEach(prob => {
      myProblemsProgressMap[prob.id.toString()] = {
        status: (prob.status as Status) || Status.NotStarted,
        remarks: prob.remarks || ''
      };
    });
    setMyProblemsProgress(myProblemsProgressMap);
  };

  // Delete Personal Problem
  const handleDeletePersonalProblem = async (id: number) => {
    await deletePersonalProblem(id);
    setPersonalProblems(personalProblems.filter(p => p.id !== id));
    
    // Remove from progress
    const newMyProblemsProgress = { ...myProblemsProgress };
    delete newMyProblemsProgress[id.toString()];
    setMyProblemsProgress(newMyProblemsProgress);
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      setSession(null);
      // Reload progress from localStorage
      const localProgress = await loadProgress();
      setProgress(localProgress);
    }
  };

  // Settings
  const handleSaveKey = (key: string) => {
    setAiApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  // Show authentication screen if not authenticated and not in guest mode
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return <Auth onAuthSuccess={() => setShowAuth(false)} />;
  }

  // Explorer component
  const ExplorerView = () => (
    <div className="flex h-full">
      {/* Company Sidebar */}
      <CompanySidebar 
        companies={companies} 
        selectedCompany={selectedCompany} 
        onSelectCompany={handleSelectCompany}
        loading={loadingCompanies}
      />

      {/* Main Problem Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-dark-900 relative">
        
        {/* Context Bar (Selected Company & Period) */}
        {selectedCompany && (
          <div className="px-4 py-2 bg-dark-800 border-b border-dark-700 flex items-center justify-between shrink-0">
            <h2 className="text-white font-medium flex items-center gap-2">
              <span className="text-slate-400">{selectedCompany.name}</span>
              <span className="text-slate-600">/</span>
              <span className="text-primary-400">{selectedFile?.name || 'Select Period'}</span>
            </h2>
            
            <div className="flex gap-2">
              {loadingFiles ? (
                <span className="text-xs text-slate-500">Loading periods...</span>
              ) : (
                files.map(f => (
                  <button
                    key={f.path}
                    onClick={() => handleSelectFile(f, selectedCompany.name)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      selectedFile?.path === f.path 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-dark-700 text-slate-300 hover:bg-dark-600'
                    }`}
                  >
                    {f.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-900/20 border-b border-red-900/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        {!selectedCompany ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <p>Select a company from the sidebar to view problems.</p>
          </div>
        ) : loadingProblems ? (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4"></div>
              Loading problems...
           </div>
        ) : (
          <ProblemTable 
            problems={problems}
            onAskAI={setActiveAIProblem}
            onAddToMyProblems={handleAddToMyProblems}
          />
        )}
        
        {/* AI Panel Overlay */}
        {activeAIProblem && (
            <GeminiPanel 
              problem={activeAIProblem} 
              onClose={() => setActiveAIProblem(null)}
              apiKey={aiApiKey}
            />
        )}
      </div>
    </div>
  );

  return (
    <Layout 
      session={session}
      onSignOut={handleSignOut}
      onSignIn={() => setShowAuth(true)}
    >
      <Routes>
        <Route path="/" element={<Dashboard progressMap={progress} totalProblemsSeen={problems.length} />} />
        <Route path="/explorer" element={<ExplorerView />} />
        <Route path="/my-problems" element={
          <MyProblems
            problems={personalProblems}
            progressMap={myProblemsProgress}
            onDelete={handleDeletePersonalProblem}
            onStatusChange={handleMyProblemsStatusChange}
            onRemarkChange={handleMyProblemsRemarkChange}
          />
        } />
      </Routes>
    </Layout>
  );
};

export default App;
