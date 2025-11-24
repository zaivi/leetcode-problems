export interface Company {
  name: string;
  path: string;
  type: 'dir' | 'file';
}

export interface ProblemFile {
  name: string;
  path: string;
  download_url: string;
}

export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  Unknown = 'Unknown'
}

export enum Status {
  NotStarted = 'Not Started',
  Todo = 'Todo',
  Solving = 'Solving',
  Solved = 'Solved',
  Revise = 'Revise'
}

export interface Problem {
  id: string; // Used as unique key
  title: string;
  difficulty: Difficulty;
  acceptance: string;
  frequency: string;
  url: string;
  company?: string;
  topics?: string;
}

export interface UserProgress {
  status: Status;
  remarks: string;
  lastUpdated: number;
}

export interface ProgressMap {
  [problemId: string]: UserProgress;
}

// Personal Problems Types (matches database schema)
export interface PersonalProblem {
  id: number;
  created_at: string;
  difficulty: string | null;
  title: string | null;
  link: string | null;
  topics: string | null;
  category_id: string | null;
  remarks: string | null;
  user_id: string | null;
  company: string | null;
  status: string | null;
}

export interface PersonalProblemInput {
  company: string;
  difficulty: string;
  title: string;
  link: string;
  topics?: string;
  status?: Status;
  user_id?: string;
}

// GitHub API Response Types
export interface GitHubContent {
  name: string;
  path: string;
  type: 'dir' | 'file';
  download_url: string | null;
}
