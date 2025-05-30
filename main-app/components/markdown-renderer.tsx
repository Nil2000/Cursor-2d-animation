import React from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Button } from "./ui/button";
import { Copy, CopyCheck } from "lucide-react";
import { useTheme } from "next-themes";

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
      className="absolute right-0 text-sm text-gray-500 p-2 mr-2 mt-2 cursor-pointer"
      variant={"secondary"}
    >
      {copied ? "Copied!" : <Copy className="h-4 w-4" />}
    </Button>
  );
}

export default function MarkedownRendered({ content }: Props) {
  const { theme } = useTheme();
  return (
    <Markdown
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <div className="relative rounded-md">
              <CodeCopyButton>{children}</CodeCopyButton>
              <SyntaxHighlighter
                {...props}
                PreTag="div"
                children={String(children).replace(/\n$/, "")}
                language={match[1]}
                style={theme === "dark" ? vscDarkPlus : vs}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  borderRadius: "0.25rem",
                  border: "1px solid" + (theme === "dark" ? "#3f3f46" : "#ddd"),
                }}
              />
            </div>
          ) : (
            <code
              {...props}
              className={
                className +
                " rounded-md font-mono w-full bg-zinc-100 dark:bg-zinc-800 p-2 text-sm"
              }
            >
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
