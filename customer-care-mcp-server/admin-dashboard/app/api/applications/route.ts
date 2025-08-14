import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../lib/direct-api-client';

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json();
    
    const result = await directApiClient.createApplication(applicationData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}