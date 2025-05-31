import { Card } from "@/components/ui/card";
import React from "react";
import MachineLogo from "./machine-logo";
import MarkedownRendered from "@/components/markdown-renderer";
import { SyncLoader } from "react-spinners";
import { useTheme } from "next-themes";

type Props = {
  messageBody: string;
  loading?: boolean;
  error?: string;
};

export default function AssistantBubble({
  messageBody,
  loading,
  error,
}: Props) {
  const { theme } = useTheme();
  return (
    <div className="flex justify-start items-end gap-2">
      <MachineLogo />
      {loading ? (
        <Card className="p-2 w-max rounded-md border-none shadow-none bg-transparent">
          <SyncLoader
            color={theme === "dark" ? "#f4f4f5" : "#27272a"}
            className="w-max"
            margin={2}
            size={8}
            speedMultiplier={0.6}
          />
        </Card>
      ) : error ? (
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
}
