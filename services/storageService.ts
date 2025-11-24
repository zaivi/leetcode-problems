import { ProgressMap, UserProgress, Status } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'leettrack_progress_v1';

/**
 * Load progress from Supabase if authenticated, otherwise from localStorage
 * RLS policies automatically filter by user_id
 */
export const loadProgress = async (userId?: string): Promise<ProgressMap> => {
  // If user is authenticated, try to load from Supabase
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('personal_problems')
        .select('*');

      if (error) {
        console.error('Failed to load progress from Supabase', error);
        return loadLocalProgress();
      }

      // Convert array to ProgressMap (keyed by id)
      const progressMap: ProgressMap = {};
      data?.forEach((item) => {
        progressMap[item.id.toString()] = {
          status: item.status as Status || Status.NotStarted,
          remarks: item.remarks || '',
          lastUpdated: new Date(item.created_at).getTime(),
        };
      });

      return progressMap;
    } catch (e) {
      console.error('Error loading progress from Supabase', e);
      return loadLocalProgress();
    }
  }

  // Fallback to localStorage
  return loadLocalProgress();
};

/**
 * Load progress from localStorage
 */
const loadLocalProgress = (): ProgressMap => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
    return {};
  }
};

/**
 * Save progress to Supabase if authenticated, otherwise to localStorage
 * Updates existing records by id (only numeric IDs are synced to Supabase)
 */
export const saveProgress = async (progress: ProgressMap, userId?: string): Promise<void> => {
  // Save to localStorage as backup
  saveLocalProgress(progress);

  // If user is authenticated, update records in Supabase
  if (userId) {
    try {
      // Update each problem individually by id
      // Filter out non-numeric IDs (old data from localStorage)
      const updates = Object.entries(progress)
        .filter(([id]) => {
          const numId = parseInt(id);
          return !isNaN(numId) && numId > 0;
        })
        .map(([id, userProgress]) => 
          supabase
            .from('personal_problems')
            .update({
              status: userProgress.status,
              remarks: userProgress.remarks,
            })
            .eq('id', parseInt(id))
        );

      // Execute all updates
      if (updates.length > 0) {
        await Promise.all(updates);
      }
    } catch (e) {
      console.error('Error saving progress to Supabase', e);
    }
  }
};

/**
 * Save progress to localStorage
 */
const saveLocalProgress = (progress: ProgressMap): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
};

/**
 * Update a single problem's progress
 */
export const updateProblemProgress = async (
  currentProgress: ProgressMap,
  problemId: string,
  updates: Partial<UserProgress>,
  userId?: string
): Promise<ProgressMap> => {
  const existing = currentProgress[problemId] || {
    status: Status.Todo,
    remarks: '',
    lastUpdated: Date.now(),
  };

  const newProgress = {
    ...currentProgress,
    [problemId]: {
      ...existing,
      ...updates,
      lastUpdated: Date.now(),
    },
  };

  await saveProgress(newProgress, userId);
  return newProgress;
};

/**
 * Sync local progress to Supabase when user logs in
 */
export const syncLocalProgressToSupabase = async (userId: string): Promise<void> => {
  const localProgress = loadLocalProgress();
  
  if (Object.keys(localProgress).length === 0) {
    return;
  }

  try {
    await saveProgress(localProgress, userId);
  } catch (e) {
    console.error('Failed to sync local progress to Supabase', e);
  }
};
