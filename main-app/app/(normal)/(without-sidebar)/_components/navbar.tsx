import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ThemeButton from "@/components/theme-button";

export default function Navbar() {
  return (
    <div className="p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/50 h-16">
      <Link href="/chat">
        <Button
          variant="outline"
          size={"icon"}
          className="cursor-pointer rounded-lg p-2"
        >
          <ArrowLeft className="size-5" />
        </Button>
      </Link>
      <ThemeButton />
    </div>
  );
}
