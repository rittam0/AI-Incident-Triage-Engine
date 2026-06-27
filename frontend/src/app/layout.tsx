import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Incident Triage Engine",
  description: "Incident triage dashboard backed by FastAPI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-border bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
              <Link href="/" className="text-xl font-semibold text-ink">
                AI Incident Triage Engine
              </Link>
              <nav className="flex gap-2 text-sm">
                <Link
                  className="rounded-md border border-border px-3 py-2 font-medium text-ink hover:bg-slate-50"
                  href="/"
                >
                  Dashboard
                </Link>
                <Link
                  className="rounded-md bg-accent px-3 py-2 font-medium text-white hover:bg-teal-800"
                  href="/incidents/new"
                >
                  Create Incident
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 lg:px-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
