import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/components/SupabaseProvider";
import HydrationErrorBoundary from "@/components/HydrationErrorBoundary";
import "@/utils/suppressWarnings"; // Import to suppress hydration warnings

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kamkunji Ndogo",
  description: "Your trusted online marketplace for quality products",
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body
        className={inter.className}
        suppressHydrationWarning={true}
      >
        <SupabaseProvider>
          <HydrationErrorBoundary>
            {children}
          </HydrationErrorBoundary>
        </SupabaseProvider>
      </body>
    </html>
  );
}
