import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Trading Floor — Member Platform",
  description: "Upload charts, view analysis, and track behavior with The Shrink.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <body>{children}</body>
    </html>
  );
}
