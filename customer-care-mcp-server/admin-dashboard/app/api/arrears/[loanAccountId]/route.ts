import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loanAccountId: string }> }
) {
  try {
    const resolvedParams = await params;
    const loanAccountId = resolvedParams.loanAccountId;
    
    const result = await directApiClient.getArrearDetails(loanAccountId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching arrear details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arrear details' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ loanAccountId: string }> }
) {
  try {
    const resolvedParams = await params;
    const loanAccountId = resolvedParams.loanAccountId;
    const data = await request.json();
    
    const result = await directApiClient.updateArrearDetails(loanAccountId, data);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating arrear details:', error);
    return NextResponse.json(
      { error: 'Failed to update arrear details' },
      { status: 500 }
    );
  }
}