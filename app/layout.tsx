import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flow",
  description: "轻盈、极简的生活记录。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

