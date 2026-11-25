import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/store/CartContext";
import { StoreShell } from "@/components/store/StoreShell";
import {
  getSeriesWithSetsAndCounts,
  getStoreSettings,
} from "@/lib/repository";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marvelous Gaming | Cartas Pokémon TCG, Sellados y Gaming",
  description:
    "Tienda especializada en cartas sueltas de todas las expansiones de Pokémon TCG, productos sellados y próximamente juegos de PS4, PS5 y accesorios.",
  icons: {
    icon: "/images/marvelous-logo.jpg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, series] = await Promise.all([
    getStoreSettings(),
    getSeriesWithSetsAndCounts(),
  ]);

  return (
    <html lang="es" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-obsidian-950 text-white antialiased">
        <CartProvider>
          <StoreShell settings={settings} series={series}>
            {children}
          </StoreShell>
        </CartProvider>
      </body>
    </html>
  );
}
