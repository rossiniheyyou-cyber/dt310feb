import "./globals.css";
import Header from "@/components/layout/Header";
import { CanonicalStoreProvider } from "@/context/CanonicalStoreContext";
import AIChatWidget from "@/components/global/AIChatWidget";
import SessionProvider from "@/components/providers/SessionProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-slate-900 font-sans">
        <SessionProvider>
          <CanonicalStoreProvider>
            <Header />
            {children}
            <AIChatWidget />
          </CanonicalStoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
