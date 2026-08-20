import type { Metadata } from "next";
import { Philosopher, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const philosopher = Philosopher({
  variable: "--font-philosopher",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ellipse — Authority Command Center",
  description: "AI-Powered Waste Response Decision Support System for Municipal Authorities",
};

import { DashboardShell } from "@/components/layout/DashboardShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${philosopher.variable} ${inter.variable} ${jetbrainsMono.variable} h-screen antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-canvas transition-colors duration-300 min-h-screen text-text-primary font-sans overflow-hidden relative">
          {/* Ambient glow in the background */}
          <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-lime/5 rounded-full blur-[140px] pointer-events-none" />
          
          <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
