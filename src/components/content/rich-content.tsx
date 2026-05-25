/* eslint-disable @next/next/no-img-element */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { displayImageSourcesInHtml, displayImageUrl } from "@/lib/media-urls";
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
        dangerouslySetInnerHTML={{ __html: displayImageSourcesInHtml(content) }}
      />
    );
  }

  return (
    <div className={cn("markdown", className)}>
      <ReactMarkdown
        components={{
          img: ({ alt, src }) => (
            <img
              alt={alt ?? ""}
              src={
                typeof src === "string"
                  ? (displayImageUrl(src) ?? src)
                  : undefined
              }
            />
          ),
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
