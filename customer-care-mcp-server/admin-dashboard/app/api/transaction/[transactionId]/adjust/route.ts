import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const transactionId = resolvedParams.transactionId;
    const data = await request.json();
    
    const result = await directApiClient.adjustTransaction(transactionId, data);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adjusting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to adjust transaction' },
      { status: 500 }
    );
  }
}