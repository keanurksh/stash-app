import type { Metadata, Viewport } from "next";
import {
  Figtree,
  Fira_Sans,
  Space_Grotesk,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RouteTransitionBar } from "@/components/route-transition-bar";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Stash App – Money Manager & Automated Expense Tracker",
    template: "%s | Stash App",
  },
  description:
    "Kelola dan track pengeluaran bulanan secara otomatis dengan fitur OCR Screenshot Mutasi dan Split Bill.",
  applicationName: "Stash App",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://stash.app"
  ),
  openGraph: {
    title: "Stash App – Money Manager & Automated Expense Tracker",
    description:
      "Kelola dan track pengeluaran bulanan secara otomatis dengan fitur OCR Screenshot Mutasi dan Split Bill.",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary",
    title: "Stash App – Money Manager & Automated Expense Tracker",
    description:
      "Kelola dan track pengeluaran bulanan secara otomatis dengan fitur OCR Screenshot Mutasi dan Split Bill.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${figtree.variable} ${firaSans.variable} ${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip">
        <RouteTransitionBar />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
