import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ statementId: string }> }
) {
  try {
    const resolvedParams = await params;
    const statementId = resolvedParams.statementId;
    
    const result = await directApiClient.getDatabricksQueryStatus(statementId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking Databricks query status:', error);
    return NextResponse.json(
      { error: 'Failed to check Databricks query status' },
      { status: 500 }
    );
  }
}