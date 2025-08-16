import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export async function syncUser(clerkUserId: string) {
  try {
    // Check if user exists in database
    let prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!prismaUser) {
      // Get user details from Clerk
      const user = await currentUser();
      if (!user) {
        throw new Error('User not found in Clerk');
      }

      // Create user in database
      prismaUser = await db.user.create({
        data: {
          clerkId: clerkUserId,
          email: user.emailAddresses[0]?.emailAddress || null,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
        }
      });

      console.log('✅ New user synced to database:', prismaUser);
    }

    return prismaUser;
  } catch (error) {
    console.error('❌ Error syncing user:', error);
    throw error;
  }
}
