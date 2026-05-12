import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Renovation AI Dashboard",
  description: "AI architectural memory system for renovation visualization."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
