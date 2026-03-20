import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import ApolloWrapper from "@/lib/ApolloWrapper";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "WeddingApp",
  description: "Elegant wedding invitation management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={playfair.variable}>
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
