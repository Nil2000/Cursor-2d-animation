import { Card } from "@/components/ui/card";
import React from "react";
import MachineLogo from "./machine-logo";

type Props = {
  messageBody: string;
};

export default function AssistantBubble({ messageBody }: Props) {
  return (
    <div className="flex justify-start items-end gap-2">
      <MachineLogo />
      <Card className="p-4 sm:max-w-3/4 max-w-full w-max rounded-md">
        {messageBody}
        by assistant
      </Card>
    </div>
  );
}
