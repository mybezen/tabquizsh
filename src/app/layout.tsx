import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Periodik — Ruang Belajar Kimia",
  description: "Belajar sistem tabel periodik unsur secara interaktif.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
