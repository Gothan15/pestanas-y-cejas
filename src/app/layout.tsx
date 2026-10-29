import type { Metadata } from "next";
import { Archivo, Fraunces } from "next/font/google";
import { negocio } from "@/config/negocio";
import "./globals.css";

// Tipografía editorial: Fraunces (serif con carácter, para titulares
// y cifras) + Archivo (sans limpia para texto y datos). Cambiar el
// preset de fuente de la plantilla = cambiar estas dos familias.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});
const archivo = Archivo({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${negocio.nombre} — ${negocio.rubro} · Reserva por WhatsApp`,
  description: negocio.descripcion,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${fraunces.variable} ${archivo.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
