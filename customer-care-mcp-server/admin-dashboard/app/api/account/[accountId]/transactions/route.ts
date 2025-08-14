import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const resolvedParams = await params;
    const accountId = resolvedParams.accountId;
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const transactionView = (searchParams.get('transactionView') || 'CUSTOMER_VIEW') as 'CUSTOMER_VIEW' | 'FULL_VIEW';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }
    
    const transactions = await directApiClient.getTransactions(
      accountId,
      startDate,
      endDate,
      transactionView
    );

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}