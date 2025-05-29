"use client";

import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
};

export default function TextComponent({ value, onChange, onKeyDown }: Props) {
  return (
    <div className="*:not-first:mt-2">
      <Textarea
        id="first_text"
        placeholder="Write something..."
        rows={8}
        className="field-sizing-content max-h-29.5 min-h-0 resize-none py-1.75 focus-visible:ring-0 border-none shadow-none"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
