import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const resolvedParams = await params;
    const cardId = resolvedParams.cardId;
    
    const result = await directApiClient.getCardPinStatus(cardId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching card PIN status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card PIN status' },
      { status: 500 }
    );
  }
}