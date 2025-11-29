"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Card className="w-full max-w-md border-border/50 shadow-xl backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-2">
          <motion.div
            className="mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Link href="/">
              <Logo />
            </Link>
          </motion.div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold font-dm_serif">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to continue creating amazing 2D animations
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <motion.div
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-powered animation generation</span>
          </motion.div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Continue with
              </span>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 text-base font-medium border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <FcGoogle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Sign in with Google
                </>
              )}
            </Button>
          </motion.div>
          <motion.p
            className="text-center text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
