import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "KK Deals - Save Food, Save Money in Kota Kinabalu",
  description: "Find surplus food, fresh produce, and great deals from local vendors in Kota Kinabalu. Reduce food waste, save money!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}