import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type RichContentProps = {
  content: string;
  format?: "MARKDOWN" | "HTML";
  className?: string;
};

export function RichContent({
  content,
  format = "MARKDOWN",
  className,
}: RichContentProps) {
  if (format === "HTML") {
    return (
      <div
        className={cn("markdown", className)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={cn("markdown", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
