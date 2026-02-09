import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // ← Импортируем Header

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Курсы программирования",
  description: "Выбор курсов программирования для любого возраста",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header /> {/* ← Добавляем Header здесь */}
        <main className="flex-1">{children}</main>
        
        {/* Простой футер */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg font-semibold mb-2">Курсы программирования</p>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Все права защищены
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}