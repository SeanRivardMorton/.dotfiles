import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ statementId: string }> }
) {
  try {
    const resolvedParams = await params;
    const statementId = resolvedParams.statementId;
    const { searchParams } = new URL(request.url);
    const chunkIndex = parseInt(searchParams.get('chunk_index') || '0');
    
    const result = await directApiClient.getDatabricksQueryResults(statementId, chunkIndex);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching Databricks query results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Databricks query results' },
      { status: 500 }
    );
  }
}