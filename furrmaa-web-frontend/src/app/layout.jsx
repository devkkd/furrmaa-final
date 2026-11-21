import { Mona_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApiWarmup from "@/components/ApiWarmup";

const monaSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona",
});

export const metadata = {
  metadataBase: new URL("https://furrmaa.com"),
  title: "Furrmaa.com | Online Pet Store, Vets & Training India",
  description: "Furrmaa is a complete pet-care platform from Jaipur. Shop pet food, toys and grooming, find vets and shelters, and learn dog training.",
  alternates: {
    canonical: "https://furrmaa.com/",
  },

  verification: {
    google: "wtlYAi09_nJhIQnihNunuJqAcjslW8SlW39lC_kRkHY",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={monaSans.variable}>
      <body className="antialiased" suppressHydrationWarning>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-36SRNRRLDD"
          strategy="lazyOnload"
        />

        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-36SRNRRLDD');
          `}
        </Script>

        <ApiWarmup />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
