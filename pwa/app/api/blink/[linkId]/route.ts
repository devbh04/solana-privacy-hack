import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlinkCard from '@/models/BlinkCard';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    await dbConnect();

    const { linkId } = await params;

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    const blinkCard = await BlinkCard.findOne({ linkId });

    if (!blinkCard) {
      return NextResponse.json(
        { error: 'Blink card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: blinkCard }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blink card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blink card' },
      { status: 500 }
    );
  }
}
