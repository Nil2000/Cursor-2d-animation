import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React from "react";

export default function FooterCredits() {
  return (
    <Card className="h-max rounded-lg bg-gradient-to-tr dark:from-yellow-800 dark:to-yellow-400 from-yellow-600 to-yellow-200 border-none p-[3px] text-sm">
      <div className="w-full h-full bg-accent rounded-md p-2 flex flex-col justify-center space-y-2">
        <div className="flex justify-between">
          <h1>Credits left:</h1>
          <h1>10</h1>
        </div>
        <div className="h-1 w-full rounded-full bg-zinc-300 dark:bg-zinc-600">
          <div className="h-full w-[50%] rounded-full bg-green-400"></div>
        </div>
        <Button variant={"link"} className="mx-auto text-xs">
          Add more credits
        </Button>
      </div>
    </Card>
  );
}
