import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const resolvedParams = await params;
    const cardId = resolvedParams.cardId;
    
    const card = await directApiClient.getCard(cardId);

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error fetching card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 }
    );
  }
}