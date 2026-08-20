import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-Asisten Guru",
  description: "Workspace digital untuk menyusun perangkat pembelajaran dengan bantuan AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
