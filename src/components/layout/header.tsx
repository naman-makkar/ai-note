'use client';

import Link from 'next/link';
import { NotebookPen } from 'lucide-react'; // Example icon

export default function Header() {
  // We'll add auth state and logout button later
  const isLoggedIn = false; // Placeholder

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <NotebookPen className="h-6 w-6 text-primary" />
          <span className="font-bold inline-block">AI Notes</span>
        </Link>
        <nav className="flex items-center space-x-4">
          {/* Add navigation items or user menu later */}
          {/* Example: <Link href="/settings">Settings</Link> */}
        </nav>
      </div>
    </header>
  );
} 