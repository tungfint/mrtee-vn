import type { Metadata } from "next";
import { Dancing_Script, Geist, JetBrains_Mono } from "next/font/google";

import { SiteMusicPlayer } from "@/components/audio/site-music-player";
import { prisma } from "@/lib/prisma";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin", "vietnamese"],
});

const dancingScript = Dancing_Script({
  variable: "--font-slogan",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: {
    default: "mrtee.vn",
    template: "%s | mrtee.vn",
  },
  description:
    "Kỷ yếu số, portfolio giáo dục và blog công nghệ của thầy Tee.",
};

async function defaultPlaylist() {
  try {
    return await prisma.musicPlaylist.findFirst({
      include: {
        tracks: {
          orderBy: { sortOrder: "asc" },
          where: { enabled: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      where: { isSiteDefault: true },
    });
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const playlist = await defaultPlaylist();

  return (
    <html
      className={`${geistSans.variable} ${jetBrainsMono.variable} ${dancingScript.variable}`}
      lang="vi"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-slate-50 antialiased" suppressHydrationWarning>
        {children}
        <SiteMusicPlayer initialPlaylist={playlist} />
        <script
          dangerouslySetInnerHTML={{
            __html:
              'document.querySelectorAll("[bis_skin_checked]").forEach(function(node){node.removeAttribute("bis_skin_checked");});',
          }}
        />
      </body>
    </html>
  );
}
