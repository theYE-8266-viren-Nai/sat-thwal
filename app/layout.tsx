import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansMyanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  display: "swap",
  variable: "--font-myanmar",
});

export const metadata: Metadata = {
  title: "ဆက်သွယ် ",
  description:
    "One student request. Four personalized solutions — tutors, hostels, food, and transportation for Myanmar university students.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansMyanmar.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          {children}
          <Toaster position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
