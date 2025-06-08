import { NextRequest, NextResponse } from 'next/server';
import { validateGSTINFormat, GSTVerificationResponse } from '@/lib/gst-validator';

export async function POST(request: NextRequest) {
  try {
    const { gstin, apiKey, provider = 'format-only' } = await request.json();

    if (!gstin) {
      return NextResponse.json(
        { error: 'GSTIN is required' },
        { status: 400 }
      );
    }

    // First, validate format
    const formatValidation = validateGSTINFormat(gstin);
    if (!formatValidation.isValid) {
      return NextResponse.json({
        isValid: false,
        errors: formatValidation.errors
      });
    }

    // If only format validation is requested
    if (provider === 'format-only' || !apiKey) {
      return NextResponse.json({
        isValid: true,
        gstin: gstin.replace(/\s/g, '').toUpperCase(),
        stateCode: formatValidation.stateCode,
        stateName: formatValidation.stateName,
        panNumber: formatValidation.panNumber,
        entityNumber: formatValidation.entityNumber,
        checksum: formatValidation.checksum,
        verificationMethod: 'format-validation-only',
        message: apiKey ? 'Format validation passed' : 'Online verification requires API key'
      });
    }

    // Online verification with third-party services
    let verificationResult: GSTVerificationResponse;

    switch (provider) {
      case 'knowyourgst':
        verificationResult = await verifyWithKnowYourGST(gstin, apiKey);
        break;
      case 'cashfree':
        // For Cashfree, apiKey should contain both clientId and clientSecret separated by ':'
        const [clientId, clientSecret] = apiKey.split(':');
        if (!clientId || !clientSecret) {
          verificationResult = {
            isValid: false,
            errors: ['Cashfree requires both client ID and client secret separated by ":"']
          };
        } else {
          verificationResult = await verifyWithCashfree(gstin, clientId, clientSecret);
        }
        break;
      case 'decentro':
        verificationResult = await verifyWithDecentro(gstin, apiKey);
        break;
      case 'official':
        verificationResult = await verifyWithOfficialAPI(gstin, apiKey);
        break;
      default:
        verificationResult = {
          isValid: false,
          errors: ['Unsupported verification provider. Available: knowyourgst, cashfree, decentro, official']
        };
    }

    return NextResponse.json(verificationResult);

  } catch (error) {
    console.error('GST verification error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Verify using KnowYourGST API (active third-party service)
async function verifyWithKnowYourGST(gstin: string, apiKey: string): Promise<GSTVerificationResponse> {
  try {
    const cleanGSTIN = gstin.replace(/\s/g, '').toUpperCase();
    const response = await fetch(`https://www.knowyourgst.com/developers/gstincall/?gstin=${cleanGSTIN}`, {
      method: 'GET',
      headers: {
        'passthrough': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response based on KnowYourGST API format
    if (data.gstin && data.status) {
      return {
        isValid: true,
        gstin: cleanGSTIN,
        legalName: data['legal-name'],
        tradeName: data['trade-name'],
        registrationDate: data['registration-date'],
        status: data.status,
        businessType: data['entity-type'],
        address: data.adress ? `${data.adress.bno || ''} ${data.adress.street || ''}, ${data.adress.location || ''}, ${data.adress.state || ''} ${data.adress.pincode || ''}`.trim() : undefined,
        verificationMethod: 'knowyourgst-api'
      };
    } else {
      return {
        isValid: false,
        errors: [data.message || 'GSTIN verification failed']
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`KnowYourGST API error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// Verify using Cashfree GST Verification API
async function verifyWithCashfree(gstin: string, clientId: string, clientSecret: string): Promise<GSTVerificationResponse> {
  try {
    const cleanGSTIN = gstin.replace(/\s/g, '').toUpperCase();
    const response = await fetch('https://api.cashfree.com/verification/gstin', {
      method: 'POST',
      headers: {
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        GSTIN: cleanGSTIN,
        businessName: ""
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response based on Cashfree API format
    if (data.valid === true) {
      return {
        isValid: true,
        gstin: cleanGSTIN,
        legalName: data.legal_name_of_business,
        tradeName: data.trade_name,
        registrationDate: data.date_of_registration,
        status: data.gst_in_status,
        businessType: data.constitution_of_business,
        address: data.principal_place_address,
        verificationMethod: 'cashfree-api'
      };
    } else {
      return {
        isValid: false,
        errors: [data.message || 'GSTIN verification failed']
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Cashfree API error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// Verify using Decentro GST Verification API
async function verifyWithDecentro(gstin: string, apiKey: string): Promise<GSTVerificationResponse> {
  try {
    const cleanGSTIN = gstin.replace(/\s/g, '').toUpperCase();
    const response = await fetch('https://in.staging.decentro.tech/v2/kyb/gstin', {
      method: 'POST',
      headers: {
        'client_id': apiKey,
        'client_secret': apiKey, // You'd need separate client_secret
        'module_secret': apiKey, // You'd need separate module_secret
        'provider_secret': apiKey, // You'd need separate provider_secret
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference_id: `ref_${Date.now()}`,
        gstin: cleanGSTIN
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response based on Decentro API format
    if (data.status === 'SUCCESS' && data.data) {
      return {
        isValid: true,
        gstin: cleanGSTIN,
        legalName: data.data.legal_name,
        tradeName: data.data.trade_name,
        registrationDate: data.data.registration_date,
        status: data.data.status,
        businessType: data.data.constitution_of_business,
        address: data.data.address,
        verificationMethod: 'decentro-api'
      };
    } else {
      return {
        isValid: false,
        errors: [data.message || 'GSTIN verification failed']
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Decentro API error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// Verify using Official GST Portal API (requires GSP credentials)
async function verifyWithOfficialAPI(gstin: string, apiKey: string): Promise<GSTVerificationResponse> {
  try {
    // This would require proper GSP authentication and credentials
    // For now, return a placeholder response
    return {
      isValid: false,
      errors: ['Official GST Portal API integration requires GSP credentials and proper authentication setup']
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Official API error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// GET endpoint for simple format validation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gstin = searchParams.get('gstin');

  if (!gstin) {
    return NextResponse.json(
      { error: 'GSTIN parameter is required' },
      { status: 400 }
    );
  }

  const validation = validateGSTINFormat(gstin);
  
  return NextResponse.json({
    ...validation,
    gstin: gstin.replace(/\s/g, '').toUpperCase(),
    verificationMethod: 'format-validation-only'
  });
} 