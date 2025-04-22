import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    // Use flex container to center content vertically and horizontally within the main layout area
    <div className="flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 lg:py-32">
      
      {/* Hero Content */}
      <div className="max-w-3xl">
        {/* Optional: Badge/Highlight */}
        {/* <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary-foreground bg-primary/80 rounded-full">New Features Added!</span> */}
        
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Smarter Notes, <span className="text-primary">Effortless Insights</span>
        </h1>
        
        <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl max-w-2xl mx-auto">
          Get AI-powered summaries and insights for your notes.<br></br> 
          Save time, gain clarity.
        </p>
        
        {/* Call to Action Buttons */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button size="lg" asChild>
            <Link href="/signup">
              Get Started Free 
              <UserPlus className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href="/login">
              Log In <LogIn className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Optional: Feature Section Placeholder */}
      {/* 
      <div className="mt-24 w-full max-w-5xl"> 
        <h2 className="text-2xl font-semibold text-center mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          </div>
      </div> 
      */}
      
    </div>
  );
}
