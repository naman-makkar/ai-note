'use client';

import Link from 'next/link';
import { NotebookPen, LogOut, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useSupabase } from '@/components/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, session, signOut } = useSupabase();
  const router = useRouter();
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    try {
      await signOut();
      toast.success('Successfully Signed Out');
      router.push('/login');
      router.refresh(); // Ensure state is updated fully
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Sign Out Failed', { description: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsSignOutLoading(false);
    }
  };

  const getInitials = (email?: string) => {
    if (!email) return '?';
    const parts = email.split('@')[0];
    // Take first letter of first two parts if separated by dot/underscore, else first two letters
    const nameParts = parts.split(/[._-]/);
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + (nameParts[1][0] || '')).toUpperCase();
    }
    return parts.substring(0, 2).toUpperCase();
  };
  
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0];
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        {/* Branding */}
        <Link href={session ? "/dashboard" : "/"} className="flex items-center space-x-2">
          <NotebookPen className="h-6 w-6 text-primary" />
          <span className="font-bold inline-block">AI Notes</span>
        </Link>
        
        {/* Auth Status / User Menu */}
        <div className="flex items-center gap-4">
          {session === undefined ? (
            <Skeleton className="h-8 w-24 rounded-md" /> 
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-auto px-2 py-1 space-x-2 flex items-center">
                   <span className="text-sm font-medium mr-1 hidden sm:inline-block truncate max-w-[100px]">
                       {userName || 'Account'}
                    </span>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={avatarUrl} alt={userName || 'User Avatar'} />
                    <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 z-[60]" align="end"> 
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={isSignOutLoading}>
                   {isSignOutLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-1.5 h-4 w-4"/> Login
                </Link>
              </Button>
              <Button size="sm" asChild>
                 <Link href="/signup">
                   <UserPlus className="mr-1.5 h-4 w-4"/> Sign Up
                 </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 