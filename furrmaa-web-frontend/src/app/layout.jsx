import { Mona_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const monaSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona",
});

export const metadata = {
  title: "Furrmaa",
  description: "Furrmaa is a pet care platform that provides a wide range of products and services for pets, including food, toys, grooming, and veterinary care. Our mission is to make pet care easy and accessible for all pet owners.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={monaSans.variable}>
      <body className="antialiased" suppressHydrationWarning>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
