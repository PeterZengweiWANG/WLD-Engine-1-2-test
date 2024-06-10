import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import Cinzel font from Google Fonts
// font weight: Use a value from 400 to 900, change at src\app\globals.css
import { Cinzel } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata: Metadata = {
  title: "Archiquest",
  description: "Game demos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jersey+25+Charted&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Tourney:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"></link>
      </head>
      <body className={`${inter.className} ${cinzel.className}`}>
        {children}
      </body>
    </html>
  );
}