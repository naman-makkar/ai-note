'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Note } from "@/types/database";
import { Edit, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea

interface NoteViewModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (note: Note) => void; // Function to trigger edit mode
}

export function NoteViewModal({ note, isOpen, onClose, onEdit }: NoteViewModalProps) {
  if (!isOpen || !note) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold truncate pr-10">{note.title}</DialogTitle>
          {/* Optional: Add date here if needed */}
          {/* <DialogDescription>{new Date(note.created_at).toLocaleDateString()}</DialogDescription> */}
        </DialogHeader>
        
        {/* Make content scrollable */}
        <ScrollArea className="flex-grow pr-6 -mr-6"> {/* Add padding compensation for scrollbar */} 
          <div className="py-4 space-y-4">
            <div className="whitespace-pre-wrap break-words text-sm text-foreground">
              {note.content}
            </div>
            
            {note.summary && (
              <div className="mt-4 pt-4 border-t border-border/60 space-y-2 bg-muted/40 p-4 rounded-md">
                <h4 className="text-sm font-semibold text-primary tracking-wide flex items-center gap-1.5">
                   <Sparkles className="h-4 w-4"/> AI Enhancement
                </h4>
                <div className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                  {note.summary}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex-shrink-0 pt-4 border-t"> 
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
          <Button type="button" onClick={() => onEdit(note)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Note
          </Button>
          {/* Delete button could go here, triggering its own confirmation */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 