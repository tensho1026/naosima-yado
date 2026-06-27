import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naosima Yado Vacancy Monitor",
  description: "Fetch and store neconoshima vacancy calendar data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
