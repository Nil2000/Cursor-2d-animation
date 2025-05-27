import React from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Button } from "./ui/button";
import { Copy, CopyCheck } from "lucide-react";

type Props = {
  content: string;
};

function CodeCopyButton({ children }: any) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };
  return (
    <Button
      onClick={handleCopy}
      className="absolute right-0 text-sm text-gray-500 p-2 mr-2 mt-2"
    >
      {copied ? "Copied!" : <Copy className="h-4 w-4" />}
    </Button>
  );
}

export default function MarkedownRendered({ content }: Props) {
  return (
    <Markdown
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <div style={{ position: "relative" }}>
              <CodeCopyButton>{children}</CodeCopyButton>
              <SyntaxHighlighter
                {...props}
                PreTag="div"
                children={String(children).replace(/\n$/, "")}
                language={match[1]}
                style={darcula} // You can change this to darcula or any other style
              />
            </div>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
}
