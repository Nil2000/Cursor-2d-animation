"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight-new";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  const { theme } = useTheme();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center antialiased relative overflow-hidden">
      <Spotlight
        theme={
          theme === "system" ? "dark" : theme === "dark" ? "dark" : "light"
        }
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20"
        >
          <FileQuestion className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-7xl font-bold text-primary font-serif tracking-tight"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-bold text-foreground">Page not found</h2>
          <p className="text-muted-foreground max-w-md">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Button asChild size="lg" className="mt-2 group cursor-pointer">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
