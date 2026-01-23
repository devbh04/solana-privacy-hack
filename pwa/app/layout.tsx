'use client';

import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { ActionDialog } from "@/components/ActionDialog";
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
  
  // Show navbar on all pages except the landing page
  const showNavbar = pathname !== '/';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PhantomCard</title>
        <meta name="description" content="NFC Enabled Web3 Credit Card" />
      </head>
      <body
        className={`${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <WalletProviders>
            {children}
            {showNavbar && <BottomNav />}
            <ActionDialog />
          </WalletProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
