import { LucideProps, Loader2 } from "lucide-react";

// Define the Google logo SVG as a React component
const GoogleLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.48 1.67-4.68 1.67-4.7 0-8.5-3.87-8.5-8.58s3.8-8.58 8.5-8.58c2.6 0 4.5.97 6.08 2.38l-2.48 2.48c-.85-.8-2.18-1.3-3.6-1.3-3.4 0-6.17 2.83-6.17 6.25s2.77 6.25 6.17 6.25c2.05 0 3.13-.8 3.9-1.65.7-.7.95-1.65.95-2.85H12.48z" />
  </svg>
);

// Export the icons
export const Icons = {
  spinner: Loader2, // Use Loader2 from lucide-react for spinner
  google: GoogleLogo,
}; 