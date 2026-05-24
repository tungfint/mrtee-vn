import type * as React from "react";

import { cn } from "@/lib/utils";

type BackgroundCardProps = React.ComponentProps<"div"> & {
  backgroundImage?: string | null;
  overlayClassName?: string;
};

export function BackgroundCard({
  backgroundImage,
  overlayClassName,
  className,
  children,
  style,
  ...props
}: BackgroundCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/70 bg-white shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/60 transition duration-300",
        "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.38),transparent_38%)] before:content-['']",
        className,
      )}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundPosition: "center",
        backgroundSize: "cover",
        ...style,
      }}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]",
          overlayClassName,
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
