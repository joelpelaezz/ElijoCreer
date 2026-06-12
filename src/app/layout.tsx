import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/auth/session-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { PWARegister } from "@/components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ElijoCreer — Prode del Mundial 2026",
  description:
    "Creá grupos, cargá tus pronósticos y competí con amigos en el prode del Mundial 2026.",
  metadataBase: new URL("https://elijocreer.vercel.app"),
  openGraph: {
    title: "ElijoCreer — Prode del Mundial 2026",
    description: "Creá grupos, cargá tus pronósticos y competí con amigos en el prode del Mundial 2026.",
    url: "https://elijocreer.vercel.app",
    siteName: "ElijoCreer",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ElijoCreer — Prode del Mundial 2026",
    description: "Creá grupos, cargá tus pronósticos y competí con amigos en el prode del Mundial 2026.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.svg" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#236391" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="ElijoCreer" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <SessionProvider>
          <ThemeProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </ThemeProvider>
        </SessionProvider>
        <PWARegister />
      </body>
    </html>
  );
}
