import React from "react";
import MachineLogo from "./machine-logo";

export default function AssistantRow({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-start justify-start gap-2">
      <MachineLogo />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
