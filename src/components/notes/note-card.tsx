'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, Edit, Sparkles, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@/types/database";
import { useState } from "react";
import { useDeleteNote, useUpdateNoteSummary } from "@/hooks/use-notes";
import { toast } from 'sonner';
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<string | null>(note.summary ?? null);
  const deleteNoteMutation = useDeleteNote();
  const updateSummaryMutation = useUpdateNoteSummary();

  const handleDelete = () => {
    deleteNoteMutation.mutate(note.id, {
      onError: () => setShowDeleteConfirm(false),
    });
  };

  // Helper function to escape regex special characters in section names
  const escapeRegex = (string: string): string => {
    // Escape characters with special meaning in regex
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  };

  /**
   * Extract and clean the actual content from the Gemini API response.
   * Focuses on aggressively removing SDK/streaming artifacts.
   */
  const extractAndCleanContent = (response: string): string => {
    if (!response) return '';
    
    try {
      console.log("Raw Response Received for Cleaning:", JSON.stringify(response));

      // Step 1: Remove metadata blocks (f:, e:, d:)
      let cleaned = response
        // Remove f:{...} anchored to the start, including following whitespace/newlines
        .replace(/^f:\{.*?\}\s*/, ''); 
        
      // Remove e:{...} or d:{...} block if it contains 'finishReason' and appears near the end.
      // This pattern is less strict about the characters immediately before e:/d:
      // It looks for optional whitespace, e: or d:, {, contains "finishReason", ends with }, optional whitespace, end of string $.
      cleaned = cleaned.replace(/\s*[ed]:\{[\s\S]*?"finishReason"[\s\S]*?\}\s*$/, '');

      console.log("After Metadata Removal:", JSON.stringify(cleaned));

      // Step 2: Remove the numeric prefixes and surrounding quotes (0:"..." pattern)
      cleaned = cleaned.replace(/\b\d+:\"([\s\S]*?)\"\s*(?=(\b\d+:\"|$))/g, '$1\n'); 
      cleaned = cleaned.replace(/\b\d+:\"?/g, ''); // Remove remaining 0:" or 0:
      cleaned = cleaned.replace(/\"\s*$/gm, ''); // Remove trailing quotes at the end of lines (multi-line)
      
      console.log("After Prefix Removal:", JSON.stringify(cleaned));

      // Step 3: Normalize whitespace and newlines
      cleaned = cleaned
        .replace(/\\n/g, '\n')     // Normalize escaped newlines first
        .replace(/\r\n|\r/g, '\n') // Normalize all line breaks to \n
        .replace(/\n{3,}/g, '\n\n') // Collapse excess blank lines to max 2
        .replace(/ +\n/g, '\n')    // Remove spaces before newlines
        .replace(/\n +/g, '\n')    // Remove spaces after newlines
        .replace(/ +/g, ' ')       // Normalize multiple spaces to single space
        .replace(/^\s+/gm, '')    // Remove leading whitespace from each line
        .trim();

      console.log("Final Cleaned Text:", JSON.stringify(cleaned));

      // Step 4: Verify the expected structure is present
      if (!cleaned.includes("PRIORITY TASKS") || !cleaned.includes("SUMMARY") || !cleaned.includes("PRODUCTIVITY TIP")) {
          console.error("Core section headers missing after cleaning. Response was:", JSON.stringify(cleaned));
          return ""; 
      }

      // Add specific check for emojis to ensure they weren't stripped
      if (!cleaned.match(/[🎯✅💡🍅💪📝💻🧑‍🤝‍🧑👍]/)) {
         console.warn("Emojis seem to be missing after cleaning.");
      }

      return cleaned;

    } catch (e) {
      console.error("Error during cleaning process:", e);
      return ""; // Return empty on error
    }
  };

  const handleSummarize = async () => {
    if (!note.content) {
      toast.error("Cannot summarize empty note.");
      return;
    }

    setIsSummarizing(true);
    setCurrentSummary(""); // Clear summary immediately
    let rawResponse = ''; // Accumulate raw response here

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note.content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      // Ensure decoder handles potential multi-byte characters (like emojis) correctly
      const decoder = new TextDecoder('utf-8'); 
      let done = false;

      // Read the entire stream first
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          // Decode using stream: true might help with partial multi-byte chars, but utf-8 decode usually handles it.
          const chunkValue = decoder.decode(value, { stream: true }); 
          console.log("Raw Stream Chunk:", chunkValue); // Log raw chunks
          rawResponse += chunkValue;
          // --- CRITICAL: Do NOT update state here ---
        }
      }
      // Ensure the decoder flushes any remaining bytes (though usually not needed if stream ends properly)
      // const finalChunk = decoder.decode(); // Usually empty, but good practice
      // if (finalChunk) rawResponse += finalChunk; 
      
      console.log("Completed Raw Response:", rawResponse);

      // Now, clean the *entire* response after the stream is finished
      const cleanedContent = extractAndCleanContent(rawResponse);
      console.log("Cleaned Content:", cleanedContent);

      if (cleanedContent) {
        // Update the UI with the final cleaned content
        setCurrentSummary(cleanedContent);
        // Save the cleaned content to the database
        updateSummaryMutation.mutate({ noteId: note.id, summary: cleanedContent });
      } else {
        // If cleaning failed or returned empty, show info and revert summary
        toast.info("AI summary could not be processed.");
        setCurrentSummary(note.summary ?? null);
      }

    } catch (error: any) {
      console.error("Summarization error:", error);
      toast.error("Failed to Summarize", { description: error.message || "An error occurred." });
      setCurrentSummary(note.summary ?? null); // Revert on error
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <>
        <Card className={cn(
          "flex flex-col h-full",
          "bg-card text-card-foreground",
          "border border-border rounded-lg shadow-sm",
          "transition-all duration-200 ease-in-out",
          "hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
        )}>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-base font-semibold leading-tight tracking-tight truncate">
              {note.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-5 flex-grow space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap break-words">
              {note.content}
            </p>
            {(currentSummary || isSummarizing) && (
              <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 bg-muted/40 p-3 rounded-md">
                 <h4 className="text-xs font-semibold text-primary tracking-wide uppercase flex items-center gap-1.5">
                   <Sparkles className="h-3.5 w-3.5"/> AI Enhancement
                 </h4>
                 {isSummarizing && !currentSummary ? (
                    <div className="space-y-1.5 pt-1">
                        <Skeleton className="h-3 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                        <Skeleton className="h-3 w-3/5 rounded" />
                    </div>
                 ) : (
                     <div className="text-sm text-foreground/90 whitespace-pre-wrap break-words pt-0.5">
                        {currentSummary}
                     </div>
                 )}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-3 pb-3 px-5 mt-auto flex justify-between items-center border-t border-border/60 bg-muted/30 rounded-b-lg">
            <span className="text-xs text-muted-foreground">
              {new Date(note.created_at).toLocaleDateString(undefined, { 
                year: 'numeric', month: 'short', day: 'numeric' 
              })}
            </span>
            <div className="flex items-center gap-0.5">
               <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary/80 hover:bg-primary/10 hover:text-primary"
                            onClick={handleSummarize}
                            disabled={isSummarizing || updateSummaryMutation.isPending}
                        >
                            {isSummarizing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4" />
                            )}
                            <span className="sr-only">Summarize note</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Summarize note</p>
                    </TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-5 mx-1.5 bg-border"/>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => onEdit(note)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit note</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit note</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:bg-destructive/10 hover:text-destructive" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete note</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete note</p>
                  </TooltipContent>
                </Tooltip>
            </div>
          </CardFooter>
        </Card>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the note
                "<span className="font-semibold">{note.title}</span>".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteNoteMutation.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteNoteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </TooltipProvider>
  );
}

function useNoteCardLogic() {
  // Include the state and handlers previously defined within NoteCard here
  // E.g., useState for showDeleteConfirm, isSummarizing, currentSummary
  // E.g., useDeleteNote, useUpdateNoteSummary mutations
  // E.g., handleDelete, handleSummarize, extractAndCleanContent, escapeRegex functions

  // Return necessary values/functions
  return {
    // ...return states and handlers...
    extractAndCleanContent: (response: string): string => { /* function body */ return ''; },
    escapeRegex: (string: string): string => { /* function body */ return ''; }
    // ... other needed logic ...
  };
} 