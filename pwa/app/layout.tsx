'use client';

import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { WalletProviders } from "@/lib/wallet-providers";
import { ThemeProvider } from "next-themes";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Show navbar on wallet and private-payments pages
  const showNavbar = pathname.startsWith('/wallet') || pathname.startsWith('/private-payments');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PhantomCard - Privacy Payments</title>
        <meta name="description" content="Zero-Knowledge Privacy Payments on Solana" />
      </head>
      <body
        className={`${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <WalletProviders>
            {children}
            {showNavbar && <BottomNav />}
          </WalletProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
