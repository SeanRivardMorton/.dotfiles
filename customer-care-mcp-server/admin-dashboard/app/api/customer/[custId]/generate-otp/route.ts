import { NextRequest, NextResponse } from 'next/server';
import { directApiClient } from '../../../../../lib/direct-api-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ custId: string }> }
) {
  try {
    const resolvedParams = await params;
    const custId = resolvedParams.custId;
    
    const result = await directApiClient.generateOTP(custId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating OTP:', error);
    return NextResponse.json(
      { error: 'Failed to generate OTP' },
      { status: 500 }
    );
  }
}