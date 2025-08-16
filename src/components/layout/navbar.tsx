'use client';

import { UserButton, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

export function Navbar() {
  const { isSignedIn, user } = useUser();

  const { data: isAdminUser } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const userEmail = user.emailAddresses[0]?.emailAddress;
      const adminEmailsStr = process.env.NEXT_PUBLIC_ADMIN_EMAILS; // Note: NEXT_PUBLIC_ prefix
      if (!adminEmailsStr || !userEmail) return false;
      
      const adminEmails = adminEmailsStr
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      
      return adminEmails.includes(userEmail);
    },
    enabled: !!user
  });

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
              DSA Course Platform
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                {isAdminUser ? (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
                      Admin Panel
                    </Button>
                  </Link>
                ) : (
                  <span className="text-sm text-gray-600">
                    Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
                  </span>
                )}
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8'
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex space-x-2">
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign Up</Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
