import { Card } from "@/components/ui/card";
import React from "react";
import MachineLogo from "./machine-logo";
import MarkedownRendered from "@/components/markdown-renderer";
import { useTheme } from "next-themes";

type Props = {
  messageBody: string;
  error?: string;
};

const AssistantBubble = React.memo(function AssistantBubble({ messageBody, error }: Props) {
  const { theme } = useTheme();
  return (
    <div className="flex justify-start items-end gap-2">
      <MachineLogo />
      {error ? (
        <Card className="p-4 sm:max-w-3/4 max-w-full w-max rounded-md bg-red-100 text-red-800">
          <p>Error: {error}</p>
        </Card>
      ) : (
        <Card className="p-4 sm:max-w-3/4 max-w-full w-max rounded-md">
          <MarkedownRendered content={messageBody} />
        </Card>
      )}
    </div>
  );
});

export default AssistantBubble;
