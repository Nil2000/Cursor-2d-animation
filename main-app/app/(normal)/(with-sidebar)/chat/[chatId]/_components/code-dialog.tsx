import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

type Props = {
  code: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function CodeDialog({ code, isOpen, onClose }: Props) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-full max-h-[85vh] flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Generated Code</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2 mt-0!"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-auto mt-4 bg-muted/50 rounded-md p-4">
          <pre className="text-sm font-mono whitespace-pre-wrap wrap-break-word">
            <code>{code}</code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
