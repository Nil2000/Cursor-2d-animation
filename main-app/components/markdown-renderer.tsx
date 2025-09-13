import React from "react";
import Markdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Button } from "./ui/button";
import { Copy, CopyCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

type Props = {
  content: string;
  isWrapped?: boolean;
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

export default function MarkedownRendered({
  content,
  isWrapped = true,
}: Props) {
  const { theme } = useTheme();
  return (
    <Markdown
      components={{
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const codeContent = Array.isArray(children)
            ? children.join("")
            : typeof children === "string"
            ? children
            : "";
          const isInline = !match;
          return !isInline ? (
            <div className="relative rounded-md">
              <CodeCopyButton>{codeContent}</CodeCopyButton>
              <SyntaxHighlighter
                {...props}
                PreTag="div"
                children={codeContent}
                language={match ? match[1] : "text"}
                style={atomOneDark}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  backgroundColor: theme === "dark" ? "#1a1620" : "#f5ecf9",
                  color: theme === "dark" ? "#e5e5e5" : "#171717",
                  borderRadius: "0.625rem",
                  fontSize: "0.875rem",
                  fontFamily: `var(--font-mono), ${robotoMono.style.fontFamily}`,
                }}
                wrapLongLines={isWrapped}
                codeTagProps={{
                  style: {
                    fontFamily: `var(--font-mono), ${robotoMono.style.fontFamily}`,
                    fontSize: "0.85em",
                    whiteSpace: isWrapped ? "pre-wrap" : "pre",
                    overflowWrap: isWrapped ? "break-word" : "normal",
                    wordBreak: isWrapped ? "break-word" : "keep-all",
                  },
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
        strong: (props: any) => (
          <span className="font-bold">{props.children}</span>
        ),
        a: (props: any) => (
          <a className="text-primary underline" href={props.href}>
            {props.children}
          </a>
        ),
        h1: (props: any) => (
          <h1 className="my-4 text-2xl font-bold">{props.children}</h1>
        ),
        h2: (props: any) => (
          <h2 className="my-3 text-xl font-bold">{props.children}</h2>
        ),
        h3: (props: any) => (
          <h3 className="my-2 text-lg font-bold">{props.children}</h3>
        ),
      }}
    >
      {content}
    </Markdown>
  );
}
