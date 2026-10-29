import type { Metadata } from "next";
import { Bangers, Archivo } from "next/font/google";
import "./globals.css";

const display = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MindStrip — Turn Brain Chaos into Comics",
  description:
    "Built for the Meta Global AI Hackathon. Dump mental overload, get a 4-panel comic plus a 3-step action plan. Powered by Meta Muse Spark, Muse Image and SAM 3.1.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${display.variable} ${body.variable} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
