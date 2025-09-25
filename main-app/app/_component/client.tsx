"use client";
import { Spotlight } from "@/components/ui/spotlight-new";
import React from "react";
import Navbar from "./navbar";
import HeroSection from "@/components/hero-section";
import TextInputContainer from "./text-input-container";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";

export default function Client() {
  const { theme } = useTheme();
  const { data: session } = authClient.useSession();
  return (
    <div className="h-screen w-full flex flex-col antialiased relative overflow-hidden">
      <Spotlight
        theme={
          theme === "system" ? "dark" : theme === "dark" ? "dark" : "light"
        }
      />
      <div className="w-full h-full lg:w-[1000px] mx-auto flex flex-col items-center gap-4">
        <Navbar />
        <HeroSection authenticated={!!session} name={session?.user?.name} />
        <TextInputContainer />
      </div>
    </div>
  );
}
