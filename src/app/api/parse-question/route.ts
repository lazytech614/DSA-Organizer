// app/api/parse-question/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { QuestionParser } from '@/lib/questionParser';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    const parsedData = await QuestionParser.parseUrl(url);

    if (!parsedData) {
      return NextResponse.json(
        { error: 'Unable to parse question from this URL' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error('Parse question error:', error);
    return NextResponse.json(
      { error: 'Failed to parse question' },
      { status: 500 }
    );
  }
}
