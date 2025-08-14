import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const resolvedParams = await params;
    const cardId = resolvedParams.cardId;
    const data = await request.json();
    
    const result = await directApiClient.voidCard(cardId, data);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error voiding card:', error);
    return NextResponse.json(
      { error: 'Failed to void card' },
      { status: 500 }
    );
  }
}