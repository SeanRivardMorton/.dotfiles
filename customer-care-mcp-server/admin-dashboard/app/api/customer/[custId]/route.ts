import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../lib/direct-api-client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ custId: string }> }
) {
  try {
    const resolvedParams = await params;
    const custId = resolvedParams.custId;
    
    const customer = await directApiClient.getCustomer(custId);

    return NextResponse.json(customer, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500, headers: corsHeaders }
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
    const data = await request.json();
    
    const result = await directApiClient.updateCustomer(custId, data);

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500, headers: corsHeaders }
    );
  }
}