'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Shield, BookOpen, Plus, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Shield },
    { href: '/admin/questions', label: 'Manage Questions', icon: List },
  ];

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/admin" className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-orange-400" />
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'default' : 'ghost'}
                  className={`flex items-center space-x-2 ${
                    pathname === item.href
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}

            {/* Back to Main Site */}
            <Link href="/">
              <Button variant="outline" className="border-gray-600 hover:bg-gray-700">
                Back to Site
              </Button>
            </Link>

            {/* User Button */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}
