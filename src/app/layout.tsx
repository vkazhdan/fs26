import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Побачення", description: "Побачення для пари" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className="min-h-screen">
        <header className="border-b border-rose-100 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-semibold text-rose-600">❤ Побачення</Link>
            <Link href="/new" className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600">
              Створити побачення
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
