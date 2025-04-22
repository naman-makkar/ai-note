import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import SupabaseProvider from "@/components/providers/auth-provider";
import { Toaster } from "sonner";
import Header from "@/components/layout/header";

export const metadata: Metadata = {
  title: "AI Notes - Smart Note Taking",
  description: "Organize your thoughts with AI-powered summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-background text-foreground flex flex-col min-h-screen`}
      >
        <SupabaseProvider>
          <QueryProvider>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
          </QueryProvider>
        </SupabaseProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
