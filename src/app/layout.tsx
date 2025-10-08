import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import ModalProvider from "@/providers/modal-provider";
import ToastProvider from "@/providers/toast-provider";
import getCategories from "@/actions/get-categories";
import CategoriesHydration from "@/components/categories-hydration";
import getStoreBillboards from "@/actions/get-store-billboards";
import StoreBillboardsHydration from "@/components/store-billboards-hydration";

const font = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecommerce Store",
  description: "Its a ecommerce store built with nextjs 15",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const categories = await getCategories();
  const storeBillboards = await getStoreBillboards();
  console.log("Categories in layout are ", categories);
  console.log("Store billboards in layout are ", storeBillboards);
  
  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased`}
      >
        <ModalProvider />
        <ToastProvider/>
        <CategoriesHydration categories={categories} />
        <StoreBillboardsHydration storeBillboards={storeBillboards} />
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
