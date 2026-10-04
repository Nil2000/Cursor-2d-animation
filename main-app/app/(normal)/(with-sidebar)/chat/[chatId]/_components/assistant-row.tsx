import React from "react";
import MachineLogo from "./machine-logo";

export default function AssistantRow({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-start gap-2">
      <MachineLogo />
      {children}
    </div>
  );
}
