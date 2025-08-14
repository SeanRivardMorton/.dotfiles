import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ custId: string }> }
) {
  try {
    const resolvedParams = await params;
    const custId = resolvedParams.custId;
    
    const preferences = await directApiClient.getCustomerCommunicationPreferences(custId);

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching customer communication preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer communication preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ custId: string }> }
) {
  try {
    const resolvedParams = await params;
    const custId = resolvedParams.custId;
    const preferences = await request.json();
    
    const result = await directApiClient.updateCustomerCommunicationPreferences(custId, preferences);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating customer communication preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update customer communication preferences' },
      { status: 500 }
    );
  }
}