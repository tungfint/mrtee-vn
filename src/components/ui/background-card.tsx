import type * as React from "react";

import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { cn } from "@/lib/utils";

type BackgroundCardProps = React.ComponentProps<"div"> & {
  backgroundImage?: string | null;
  backgroundPosition?: string | null;
  showImageAction?: boolean;
  overlayClassName?: string;
};

export function BackgroundCard({
  backgroundImage,
  backgroundPosition,
  showImageAction = false,
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
        backgroundPosition: backgroundPosition ?? "center",
        backgroundSize: "cover",
        ...style,
      }}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 bg-slate-950/38",
          overlayClassName,
        )}
      />
      {showImageAction && backgroundImage ? (
        <ImageLightboxButton
          className="absolute right-3 top-3 z-20"
          imageUrl={backgroundImage}
          label="Xem ảnh"
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
