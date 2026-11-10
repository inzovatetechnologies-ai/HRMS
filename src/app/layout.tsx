import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inzovate HRMS — Intelligent People Operations",
  description: "One Platform. Every People Operation. Intelligent Automation. Official HRMS of INZOVATE TECHNOLOGIES PRIVATE LIMITED.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
