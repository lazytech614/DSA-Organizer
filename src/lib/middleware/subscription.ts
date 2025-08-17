import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { checkSubscriptionLimit } from '@/lib/subscription';

export async function withSubscriptionLimit(
  request: NextRequest,
  action: 'CREATE_COURSE' | 'ADD_QUESTION' | 'LINK_PLATFORM', 
  courseId?: string
) {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkId: clerkUserId }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const limitCheck = await checkSubscriptionLimit(user.id, action, courseId);

  if (!limitCheck.allowed) {
    return NextResponse.json(
      { 
        error: 'Subscription limit reached',
        message: limitCheck.reason,
        upgradeRequired: true
      },
      { status: 403 }
    );
  }

  return null; // Continue with the request
}
