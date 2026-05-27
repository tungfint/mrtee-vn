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

function sanitizeEmbeddedHtml(content: string) {
  return content
    .replace(/<!doctype[^>]*>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<(?:html|body)\b[^>]*>/gi, "")
    .replace(/<\/(?:html|body)>/gi, "")
    .replace(/<(?:meta|link|base|title)\b[^>]*>/gi, "");
}

export function RichContent({
  content,
  format = "MARKDOWN",
  className,
}: RichContentProps) {
  if (format === "HTML") {
    return (
      <div
        className={cn("markdown", className)}
        dangerouslySetInnerHTML={{
          __html: displayImageSourcesInHtml(sanitizeEmbeddedHtml(content)),
        }}
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
