import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "../context";
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
  title: "Bacteria-Phages Graph",
  description: "Interactive visualization tool for bacteria-phage interaction data analysis",
};

/**
 * Root Layout Component
 * 
 * Provides the base HTML structure and global context providers for the entire application.
 * Sets up font variables, theme management, and the application-wide state context.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The root layout with context providers
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
