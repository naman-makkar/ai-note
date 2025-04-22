'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { noteSchema, type NoteSchema } from '@/lib/validators/notes';
import type { Note } from '@/types/database';

interface NoteFormProps {
  onSubmit: (values: NoteSchema) => void;
  initialData?: Note | null;
  isPending: boolean;
}

export function NoteForm({ onSubmit, initialData, isPending }: NoteFormProps) {
  const form = useForm<NoteSchema>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
    },
  });

  const handleSubmit = (values: NoteSchema) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Note" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Start writing your note here...\nSupports markdown!"
                  {...field}
                  className="min-h-[150px] resize-y"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
           <Button type="submit" disabled={isPending}>
            {isPending ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Note')}
          </Button>
        </div>
      </form>
    </Form>
  );
} 