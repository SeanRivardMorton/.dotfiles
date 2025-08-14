import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loanAccountId: string }> }
) {
  try {
    const resolvedParams = await params;
    const loanAccountId = resolvedParams.loanAccountId;
    
    const result = await directApiClient.getPlans(loanAccountId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}