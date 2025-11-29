import React from "react";
import SignInForm from "./_components/signin-form";
import { Spotlight } from "@/components/ui/spotlight-new";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-background">
      <Spotlight />
      <div className="relative z-10 w-full max-w-md px-4">
        <SignInForm />
      </div>
      <div className="relative z-10 mt-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
