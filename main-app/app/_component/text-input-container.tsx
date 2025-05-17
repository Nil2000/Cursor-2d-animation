import TextComponent from "@/components/text-component";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
import React from "react";

export default function TextInputContainer() {
  return (
    <div className="w-full max-w-[500px] p-3 z-10 rounded-2xl bg-white shadow-lg dark:bg-zinc-800 ring-1 ring-gray-200 dark:ring-zinc-700">
      <TextComponent />
      <div className="flex justify-end">
        <Button className="rounded-full h-9 w-9">
          <ArrowUp size={18} />
        </Button>
      </div>
    </div>
  );
}
