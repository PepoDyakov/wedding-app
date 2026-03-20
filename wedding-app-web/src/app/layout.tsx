import type { Metadata } from "next";
import "./globals.css";
import ApolloWrapper from "@/lib/ApolloWrapper";

export const metadata: Metadata = {
  title: "Wedding App",
  description: "Create and manage your wedding invitations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}