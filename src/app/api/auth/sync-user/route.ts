import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists', user: existingUser });
    }

    // Create user in database
    const dbUser = await db.user.create({
      data: {
        clerkId: clerkUserId,
        email: user.emailAddresses[0]?.emailAddress || null,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
      }
    });

    console.log('✅ New user created in database:', dbUser);
    return NextResponse.json({ message: 'User created successfully', user: dbUser });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
