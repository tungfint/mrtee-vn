import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type MrTeeLogoProps = {
  className?: string;
  href?: string;
  label?: string;
  mode?: "full" | "icon";
  suffix?: string;
  size?: "sm" | "md";
};

function LogoMark({
  className,
  label = "MrTee.VN",
  mode = "full",
  size = "md",
  suffix,
}: Omit<MrTeeLogoProps, "href">) {
  const isFull = mode === "full";
  const imageClass = isFull
    ? size === "sm"
      ? "h-8 w-auto sm:h-9"
      : "h-10 w-auto sm:h-12"
    : size === "sm"
      ? "h-9 w-auto"
      : "h-11 w-auto";

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <Image
        alt={label}
        className={cn("block shrink-0 select-none", imageClass)}
        draggable={false}
        height={isFull ? 120 : 200}
        src={isFull ? "/brand/logo-full-clean.svg" : "/brand/logo-icon-clean.svg"}
        width={isFull ? 500 : 200}
      />
      {suffix ? (
        <span className="truncate font-code text-sm font-semibold text-inherit">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}

export function MrTeeLogo({
  className,
  href = "/",
  label = "MrTee.VN",
  mode = "full",
  size = "md",
  suffix,
}: MrTeeLogoProps) {
  if (!href) {
    return <LogoMark className={className} label={label} mode={mode} size={size} suffix={suffix} />;
  }

  return (
    <Link aria-label={label} className={cn("inline-flex min-w-0", className)} href={href}>
      <LogoMark label={label} mode={mode} size={size} suffix={suffix} />
    </Link>
  );
}
