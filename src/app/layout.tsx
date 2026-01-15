import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elite Cleaning - Gestión de Limpiezas",
  description: "Plataforma de gestión de limpiezas para propiedades de alquiler turístico",
  // NOTA: Reemplazar con favicon.png cuando esté recortado
  icons: {
    icon: "/logos/My Elite Cleaning Logo Simple.png",
    apple: "/logos/My Elite Cleaning Logo Simple.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
