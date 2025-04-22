import { createClient } from '@/lib/supabase/client';
import type { Note } from '@/types/database';
import type { NoteSchema } from '@/lib/validators/notes';

// Get the Supabase client instance
const supabase = createClient();

/**
 * Fetches notes for the currently authenticated user.
 */
export const getNotes = async (): Promise<Note[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Creates a new note.
 */
export const createNote = async (noteData: NoteSchema): Promise<Note> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .insert([{ ...noteData, user_id: user.id }])
    .select()
    .single(); // Return the newly created note

  if (error) {
    console.error('Error creating note:', error);
    throw new Error(error.message);
  }
  if (!data) {
     throw new Error('Failed to create note, no data returned.');
  }
  return data;
};

/**
 * Updates an existing note.
 */
export const updateNote = async (noteId: string, noteData: Partial<NoteSchema>): Promise<Note> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Ensure user can only update their own notes (RLS handles this, but good practice)
  const { data, error } = await supabase
    .from('notes')
    .update(noteData)
    .eq('id', noteId)
    .eq('user_id', user.id) // Double-check ownership
    .select()
    .single();

  if (error) {
    console.error('Error updating note:', error);
    throw new Error(error.message);
  }
   if (!data) {
     throw new Error('Failed to update note, no data returned or note not found.');
  }
  return data;
};

/**
 * Deletes a note.
 */
export const deleteNote = async (noteId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Ensure user can only delete their own notes (RLS handles this)
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.id); // Double-check ownership

  if (error) {
    console.error('Error deleting note:', error);
    throw new Error(error.message);
  }
};

/**
 * Updates the summary of a specific note.
 */
export const updateNoteSummary = async (noteId: string, summary: string): Promise<Note> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .update({ summary: summary })
    .eq('id', noteId)
    .eq('user_id', user.id) // Ensure user owns the note
    .select()
    .single();

  if (error) {
    console.error('Error updating note summary:', error);
    throw new Error(error.message);
  }
  if (!data) {
     throw new Error('Failed to update note summary, no data returned or note not found.');
  }
  return data;
}; 