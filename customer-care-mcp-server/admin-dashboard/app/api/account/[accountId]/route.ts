import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const resolvedParams = await params;
    const accountId = resolvedParams.accountId;
    
    const account = await directApiClient.getAccount(accountId);

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}