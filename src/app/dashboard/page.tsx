'use client'; // Need client component for hooks and actions

import { useSupabase } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // Keep for potential future use, but not for redirect
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Import Dialog components
import { NoteForm } from "@/components/notes/note-form";
import { NoteList } from "@/components/notes/note-list";
import { useCreateNote, useUpdateNote } from "@/hooks/use-notes"; // Import mutation hooks
import type { Note } from '@/types/database';
import type { NoteSchema } from '@/lib/validators/notes';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { PlusCircle } from 'lucide-react';

// Define a loading state component for better UX
const LoadingSkeleton = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-36" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-end pt-4">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, session } = useSupabase(); 
  // const router = useRouter(); // Keep router if needed for other actions, but not for auth redirect
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();

  useEffect(() => {
    // Only set loading state based on session status determination
    // DO NOT redirect from here - middleware handles that.
    if (session !== undefined) { 
      setIsLoadingAuth(false);
      // Log if session IS unexpectedly null after loading, for debugging
      if (!session) {
        console.warn("DashboardPage: Auth loading finished, but session is still null. Middleware should have redirected.");
      }
    }
  }, [session]); // Dependency is only session

  const handleOpenCreateNote = () => {
    setEditingNote(null); 
    setIsNoteFormOpen(true);
  };

  const handleOpenEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteFormOpen(true);
  };

  const handleNoteFormSubmit = (values: NoteSchema) => {
    const mutationOptions = {
      onSuccess: () => setIsNoteFormOpen(false),
      onError: (error: any) => {
        toast.error(
          editingNote ? "Failed to update note" : "Failed to create note",
          { description: error.message || "An unexpected error occurred." }
        );
      }
    };

    if (editingNote) {
      updateNoteMutation.mutate(
        { noteId: editingNote.id, noteData: values },
        mutationOptions
      );
    } else {
      createNoteMutation.mutate(values, mutationOptions);
    }
  };

  // Show loading skeleton while auth status is being checked OR if session is null briefly after load
  // Middleware should prevent unauthorized access, so this mainly handles the initial hydration/check.
  if (isLoadingAuth || session === null) { 
    // We check session === null too, because even if middleware allows,
    // the user object might take a tick to hydrate client-side via the provider.
    // Showing skeleton prevents flicker of potentially incomplete UI.
    console.log(`DashboardPage: Rendering Skeleton (isLoadingAuth: ${isLoadingAuth}, session: ${session === null ? 'null' : 'exists'})`);
    return <LoadingSkeleton />;
  }
  
  // At this point, isLoadingAuth is false and session should exist.
  // If user object isn't hydrated yet, that's okay, the UI relying on it might show placeholders.
  // We don't need an explicit !user check to return null anymore.

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My AI Notes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Create, edit, and summarize your notes with AI assistance.
          </p>
        </div>
        
        <Dialog open={isNoteFormOpen} onOpenChange={setIsNoteFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreateNote} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
              <DialogDescription>
                {editingNote ? 'Update the details of your note.' : 'Fill in the details to create a new note.'}
              </DialogDescription>
            </DialogHeader>
            <NoteForm
              onSubmit={handleNoteFormSubmit}
              initialData={editingNote}
              isPending={createNoteMutation.isPending || updateNoteMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Note List Area */}
      <NoteList onEditNote={handleOpenEditNote} />

    </div>
  );
} 