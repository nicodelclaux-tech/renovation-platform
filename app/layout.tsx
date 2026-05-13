import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RenovAI — Renovation Platform",
  description: "AI-powered architectural visualization and renovation management."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
