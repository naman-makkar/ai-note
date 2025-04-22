'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

type SupabaseContext = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Note: onAuthStateChange will handle setting session/user to null
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]); // Re-run effect if supabase client instance changes

  return (
    <Context.Provider value={{ supabase, session, user, signOut }}>
      {children}
    </Context.Provider>
  );
}

// Custom hook to use the Supabase context
export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}; 