import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';
import { Toaster } from 'sonner';
import './globals.css';
import { UserSyncWrapper } from '@/components/providers/user-sync-wrapper';

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
      <html lang="en" className="dark">
        <body className={`${inter.className} dark:bg-gray-900 dark:text-white`}>
          <ReactQueryProvider>
             <UserSyncWrapper>
              <div className="min-h-screen bg-gray-900 text-white">
                {children}
              </div>
             </UserSyncWrapper>
            <Toaster theme="dark" />
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
