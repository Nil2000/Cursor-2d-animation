import { BackgroundLines } from "@/components/ui/background-lines";
import Navbar from "./_component/navbar";
import TextInputContainer from "./_component/text-input-container";
import { useRouter } from "next/navigation";
import React from "react";

export default function Home() {
  return (
    <div className="w-full lg:w-[1000px] mx-auto">
      <Navbar />
      <div className="relative">
        <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 gap-2">
          <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans relative z-20 font-bold tracking-tight">
            Animate Your Imagination
          </h2>
          <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
            Type it. Watch it move.
          </p>
          <TextInputContainer />
        </BackgroundLines>
      </div>
    </div>
  );
}
