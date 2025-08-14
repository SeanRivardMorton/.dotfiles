import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const resolvedParams = await params;
    const accountId = resolvedParams.accountId;
    const data = await request.json();
    
    const result = await directApiClient.applyFee(accountId, data);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error applying fee:', error);
    return NextResponse.json(
      { error: 'Failed to apply fee' },
      { status: 500 }
    );
  }
}