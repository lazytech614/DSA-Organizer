import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DSA Course Platform',
  description: 'A platform for organizing and tracking DSA questions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ReactQueryProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
            <Toaster />
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
