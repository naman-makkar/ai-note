'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSupabase } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { emailPasswordSchema, type EmailPasswordSchema } from '@/lib/validators/auth';
import { useState } from 'react';
import { Icons } from "@/components/icons";
import Link from 'next/link';

export default function SignupPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<EmailPasswordSchema>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: EmailPasswordSchema) {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);
    if (error) {
      toast.error('Signup Failed', { description: error.message });
    } else {
      toast.success('Signup Successful', { description: 'Check your email for confirmation!' });
      // Optional: Redirect to a confirmation pending page or login page
      // router.push('/login'); 
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setIsGoogleLoading(false);
      toast.error('Google Signup Failed', { description: error.message });
    }
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} type="email" disabled={isLoading || isGoogleLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Password" {...field} type="password" disabled={isLoading || isGoogleLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-2" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
          
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            {isGoogleLoading ? 'Redirecting...' : 'Sign Up with Google'}
          </Button>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account? {' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 