import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Navegador de Lotes Inmobiliarios",
  description: "Explora lotes disponibles organizados por zonas y manzanas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  );
}
