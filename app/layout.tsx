import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: {
      default: "ChipMa – individuelle Pfandchips",
      template: "%s | ChipMa",
    },
    description:
      "Pfandchips und Wertmarken in kleinen Auflagen, mit eigener Form, Farbe und Personalisierung. Gefertigt von PrintMa in Engen.",
    openGraph: {
      type: "website",
      locale: "de_DE",
      title: "ChipMa – Pfandchips, die niemand wegwirft",
      description:
        "Individuelle Pfandchips ab 25 Stück. Gestalten, Preis prüfen und unverbindlich anfragen.",
      siteName: "ChipMa",
      images: [
        {
          url: socialImage,
          width: 1536,
          height: 1024,
          alt: "ChipMa – individuelle Pfandchips von PrintMa",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "ChipMa – individuelle Pfandchips",
      description: "Eigene Form, Farbe und Beschriftung – gefertigt in Engen.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
