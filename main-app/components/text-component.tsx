"use client";

import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  ref?: React.Ref<HTMLDivElement>;
  disabled?: boolean;
};

export default function TextComponent({
  value,
  onChange,
  onKeyDown,
  ref,
  disabled = false,
}: Props) {
  return (
    <div className="*:not-first:mt-2" ref={ref}>
      <Textarea
        id="first_text"
        placeholder={disabled ? "No credits available..." : "Write something..."}
        // rows={8}
        className="field-sizing-content max-h-29.5 min-h-0 resize-none py-1.75 focus-visible:ring-0 border-none shadow-none"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
    </div>
  );
}
