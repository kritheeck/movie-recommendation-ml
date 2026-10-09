import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { EvaluatorBanner } from "@/components/layout/EvaluatorBanner";
import { Footer } from "@/components/layout/Footer";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Movie Recommendation System & Lab",
    default: "Movie Recommendation System — Academic ML Platform",
  },
  description:
    "An academic ML platform for personalized movie recommendations, blind A/B evaluation, " +
    "and reproducible multi-seed offline experiment benchmarks on MovieLens.",
  keywords: [
    "movie recommendations",
    "machine learning",
    "collaborative filtering",
    "content-based filtering",
    "hybrid recommender",
    "experiment lab",
    "reproducible research",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-slate-100 antialiased min-h-screen flex flex-col`}
      >
        <ConvexClientProvider>
          <EvaluatorBanner />
          <AppHeader />
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
            {children}
          </div>
          <Footer />
        </ConvexClientProvider>
      </body>

    </html>
  );
}
