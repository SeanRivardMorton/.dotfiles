import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const resolvedParams = await params;
    const applicationId = resolvedParams.applicationId;
    
    const result = await directApiClient.getApplicationStatus(applicationId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching application status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application status' },
      { status: 500 }
    );
  }
}