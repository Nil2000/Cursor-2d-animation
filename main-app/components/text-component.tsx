"use client";

import { Textarea } from "@/components/ui/textarea";

export default function TextComponent() {
  return (
    <div className="*:not-first:mt-2">
      <Textarea
        id="first_text"
        placeholder="Write something..."
        rows={8}
        className="field-sizing-content max-h-29.5 min-h-0 resize-none py-1.75 focus-visible:ring-0 border-none shadow-none"
      />
    </div>
  );
}
