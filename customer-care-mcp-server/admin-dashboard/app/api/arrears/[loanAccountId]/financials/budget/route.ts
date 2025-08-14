import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loanAccountId: string }> }
) {
  try {
    const resolvedParams = await params;
    const loanAccountId = resolvedParams.loanAccountId;
    
    const result = await directApiClient.getBudgetTotals(loanAccountId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching budget totals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget totals' },
      { status: 500 }
    );
  }
}