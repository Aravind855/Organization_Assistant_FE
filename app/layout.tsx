import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Productivity Assistant | Gmail & Calendar",
  description: "AI-powered Productivity Assistant for Gmail & Google Calendar management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-slate-950 text-slate-100 antialiased overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
