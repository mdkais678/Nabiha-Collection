import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/components/cart-provider";

export const metadata: Metadata = {
  title: "NABIHA COLLECTION | Elegance in Every Thread",
  description: "Discover elegant Pakistani women's fashion at NABIHA COLLECTION.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: { title: "NABIHA COLLECTION", description: "Elegance in Every Thread", type: "website" }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><CartProvider><Header />{children}<Footer /></CartProvider></body></html>;
}
