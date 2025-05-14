"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
      <Frown className="w-24 h-24 text-destructive mb-6" />
      <h1 className="text-4xl font-bold text-foreground mb-4">Oops! Something went wrong.</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        We encountered an unexpected issue. Please try again, or if the problem persists, contact support.
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        size="lg"
      >
        Try again
      </Button>
      <p className="text-sm text-muted-foreground mt-10">Error details: {error.message}</p>
      {error.digest && <p className="text-xs text-muted-foreground mt-1">Digest: {error.digest}</p>}
    </div>
  );
}
