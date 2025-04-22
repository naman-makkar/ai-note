import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotes, createNote, updateNote, deleteNote, updateNoteSummary } from '@/services/notes';
import type { Note } from '@/types/database';
import type { NoteSchema } from '@/lib/validators/notes';
import { toast } from 'sonner';

const NOTES_QUERY_KEY = ['notes'];

/**
 * Hook to fetch notes for the current user.
 */
export const useGetNotes = () => {
  return useQuery<Note[], Error>({
    queryKey: NOTES_QUERY_KEY,
    queryFn: getNotes,
    // Optional: Add staleTime or refetch options if needed
     staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create a new note.
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, NoteSchema>({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      toast.success('Note Created', { description: `"${newNote.title}" was successfully created.` });
      // Invalidate the notes query to refetch the list
      // queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });

      // OR: Optimistically update the cache
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (oldNotes = []) => [
        newNote, // Add the new note to the beginning
        ...oldNotes,
      ]);
    },
    onError: (error) => {
      toast.error('Failed to Create Note', { description: error.message });
    },
  });
};

/**
 * Hook to update an existing note.
 */
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { noteId: string; noteData: Partial<NoteSchema> }>({
    mutationFn: ({ noteId, noteData }) => updateNote(noteId, noteData),
    onSuccess: (updatedNote) => {
      toast.success('Note Updated', { description: `"${updatedNote.title}" was successfully updated.` });
      // Invalidate to refetch
      // queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });

       // OR: Optimistically update the specific note in the cache
       queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (oldNotes = []) =>
        oldNotes.map(note =>
          note.id === updatedNote.id ? updatedNote : note
        )
      );
    },
    onError: (error) => {
      toast.error('Failed to Update Note', { description: error.message });
    },
  });
};

/**
 * Hook to delete a note.
 */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteNote, // noteId is passed directly
    onSuccess: (_, noteId) => {
      toast.success('Note Deleted');
       // Invalidate to refetch
       // queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });

      // OR: Optimistically remove the note from the cache
       queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (oldNotes = []) =>
        oldNotes.filter(note => note.id !== noteId)
      );
    },
     onError: (error) => {
      toast.error('Failed to Delete Note', { description: error.message });
    },
     // Optional: Add onMutate for optimistic updates with rollback potential
     // onMutate: async (noteIdToDelete) => { ... }
  });
};

/**
 * Hook to update a note's summary.
 */
export const useUpdateNoteSummary = () => {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { noteId: string; summary: string }>({
    mutationFn: ({ noteId, summary }) => updateNoteSummary(noteId, summary),
    onSuccess: (updatedNote) => {
      toast.success('Summary Saved', { description: `AI summary for "${updatedNote.title}" saved.` });

      // Update the specific note in the cache
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (oldNotes = []) =>
        oldNotes.map(note =>
          note.id === updatedNote.id ? updatedNote : note // Replace with the note containing the new summary
        )
      );
    },
    onError: (error) => {
      toast.error('Failed to Save Summary', { description: error.message });
    },
  });
}; 