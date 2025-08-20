import { NextRequest, NextResponse } from 'next/server';
import { PlatformService } from '@/lib/services/platform/platformService';

export async function POST(request: NextRequest) {
  try {
    const { platform, username } = await request.json();

    if (!platform || !username) {
      return NextResponse.json(
        { error: 'Platform and username are required' },
        { status: 400 }
      );
    }

    const platformService = new PlatformService();
    const userData = await platformService.fetchUserData(platform.toLowerCase(), username);
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Username not found on this platform' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      verified: true,
      data: userData 
    });

  } catch (error) {
    console.error('Platform verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify username' },
      { status: 500 }
    );
  }
}