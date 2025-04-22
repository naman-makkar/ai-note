export interface Note {
  id: string; // uuid
  user_id: string; // uuid
  title: string;
  content: string;
  summary?: string | null; // Optional field
  created_at: string; // timestamp with time zone, typically string in ISO format
} 