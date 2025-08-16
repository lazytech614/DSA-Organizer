import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AdminNavbar } from '@/components/admin/admin-navbar';

async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await currentUser();
    if (!user) return false;
    
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) return false;

    const adminEmailsStr = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
    if (!adminEmailsStr) return false;

    const adminEmails = adminEmailsStr
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    return adminEmails.includes(userEmail);
  } catch {
    return false;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminAccess = await isAdmin();
  
  if (!adminAccess) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminNavbar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
