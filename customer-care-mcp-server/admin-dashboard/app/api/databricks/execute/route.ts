import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../lib/direct-api-client';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const result = await directApiClient.executeDatabricksQueryAndWait(
      data.warehouse_id,
      data.statement,
      data.catalog,
      data.schema,
      data.parameters,
      data.max_wait_time
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error executing Databricks query:', error);
    return NextResponse.json(
      { error: 'Failed to execute Databricks query' },
      { status: 500 }
    );
  }
}