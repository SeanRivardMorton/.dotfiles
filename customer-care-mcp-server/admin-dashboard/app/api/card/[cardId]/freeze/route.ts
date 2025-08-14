import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const resolvedParams = await params;
    const cardId = resolvedParams.cardId;
    
    const result = await directApiClient.freezeCard(cardId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error freezing card:', error);
    return NextResponse.json(
      { error: 'Failed to freeze card' },
      { status: 500 }
    );
  }
}