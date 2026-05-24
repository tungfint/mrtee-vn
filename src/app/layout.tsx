import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "mrtee.vn",
    template: "%s | mrtee.vn",
  },
  description:
    "Kỷ yếu số, portfolio giáo dục và blog công nghệ của thầy Tee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
