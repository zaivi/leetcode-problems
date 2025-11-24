import { supabase } from './supabaseClient';
import { PersonalProblem, PersonalProblemInput } from '../types';

/**
 * Fetch all personal problems for the authenticated user
 * RLS policies automatically filter by user_id
 */
export const fetchPersonalProblems = async (): Promise<PersonalProblem[]> => {
  const { data, error } = await supabase
    .from('personal_problems')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching personal problems:', error);
    throw error;
  }

  console.log('Fetched personal problems:', data?.length || 0, 'problems');

  return data || [];
};

/**
 * Add a new personal problem
 * user_id should be explicitly passed to ensure proper RLS filtering
 */
export const addPersonalProblem = async (problem: PersonalProblemInput): Promise<PersonalProblem> => {
  const { data, error } = await supabase
    .from('personal_problems')
    .insert(problem)
    .select()
    .single();

  if (error) {
    console.error('Error adding personal problem:', error);
    throw error;
  }

  return data;
};

/**
 * Update a personal problem
 * Returns the updated problem or null if not found
 */
export const updatePersonalProblem = async (
  id: number,
  updates: Partial<PersonalProblemInput>
): Promise<PersonalProblem> => {
  // Update the record and return the updated row
  const { data, error } = await supabase
    .from('personal_problems')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating personal problem:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Problem not found or you do not have permission to update it');
  }

  console.log('Successfully updated problem:', data);
  return data;
};

/**
 * Delete a personal problem
 */
export const deletePersonalProblem = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('personal_problems')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting personal problem:', error);
    throw error;
  }
};

/**
 * Check if a problem already exists in personal problems
 * RLS policies automatically filter by user_id
 */
export const checkProblemExists = async (title: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('personal_problems')
    .select('id')
    .eq('title', title)
    .maybeSingle();

  if (error) {
    console.error('Error checking problem existence:', error);
    return false;
  }

  return !!data;
};

