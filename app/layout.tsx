import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Explorador Inmobiliario",
  description: "Explora proyectos inmobiliarios: loteos, edificios y más",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50 font-sans">
        <a href="#main-content" className="skip-nav">
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
