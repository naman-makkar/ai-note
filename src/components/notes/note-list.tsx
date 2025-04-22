'use client';

import { useGetNotes } from "@/hooks/use-notes";
import { NoteCard } from "./note-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@/types/database";

interface NoteListProps {
  onViewNote: (note: Note) => void;
}

export function NoteList({ onViewNote }: NoteListProps) {
  const { data: notes, isLoading, isError, error } = useGetNotes();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-6 space-y-3 animate-pulse aspect-square">
             <Skeleton className="h-5 w-3/4 rounded" />
             <Skeleton className="h-4 w-full rounded" />
             <Skeleton className="h-4 w-5/6 rounded" />
             <div className="pt-4 border-t mt-auto">
                <Skeleton className="h-8 w-1/3 rounded" /> 
             </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-6 mt-8">
        <h3 className="font-semibold mb-2">Oops! Failed to load notes.</h3>
        <p className="text-sm">Error: {error.message}</p>
        <p className="text-xs mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-10 mt-8">
        <h3 className="text-lg font-medium mb-2">No notes yet!</h3>
        <p>Ready to capture your thoughts?</p>
        <p>Click the "Create New Note" button to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onView={onViewNote} />
      ))}
    </div>
  );
} 