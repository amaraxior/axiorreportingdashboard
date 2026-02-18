import type { Metadata } from "next";
import { Poppins, Manrope } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Axior - Features & Roadmap",
  description:
    "Track the progress of Axior platform capabilities towards production readiness.",
  icons: { icon: "/axiorlogo.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
