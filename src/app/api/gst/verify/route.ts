import { NextRequest, NextResponse } from 'next/server';

interface GSTAPIProviderResponse {
  success: boolean;
  data?: {
    stjCd: string;
    dty: string;
    lgnm: string;
    stj: string;
    adadr: any[];
    cxdt: string;
    gstin: string;
    nba: string[];
    lstupdt: string;
    rgdt: string;
    ctb: string;
    pradr: {
      addr: {
        bnm: string;
        st: string;
        loc: string;
        bno: string;
        dst: string;
        lt: string;
        locality: string;
        pncd: string;
        landMark: string;
        stcd: string;
        geocodelvl: string;
        flno: string;
        lg: string;
      };
      ntr: string;
    };
    tradeNam: string;
    sts: string;
    ctjCd: string;
    ctj: string;
    einvoiceStatus: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gstin } = body;

    if (!gstin) {
      return NextResponse.json(
        { error: 'GST number is required' },
        { status: 400 }
      );
    }

    // Clean the GST number
    const cleanGstin = gstin.replace(/\s/g, '').toUpperCase();

    // Call MastersIndia API
    const apiUrl = `https://blog-backend.mastersindia.co/api/v1/custom/search/gstin/?keyword=${cleanGstin}&unique_id=dlfmlvcC6BhEkStrgbKdeLthGnZqQ1`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-GB,en;q=0.9',
        'dnt': '1',
        'origin': 'https://www.mastersindia.co',
        'priority': 'u=1, i',
        'referer': 'https://www.mastersindia.co/gst-number-search-and-gstin-verification/',
        'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
      }
    });

          if (!response.ok) {
        throw new Error(`GST API error: ${response.status} ${response.statusText}`);
      }

    const apiData: GSTAPIProviderResponse = await response.json();

    if (!apiData.success || !apiData.data) {
      return NextResponse.json(
        { 
          error: 'GST number not found or invalid',
          gstin: cleanGstin,
          isValid: false
        },
        { status: 404 }
      );
    }

    // Transform the response to our standard format
    const data = apiData.data;
    
    // Build complete address
    const addr = data.pradr?.addr;
    const addressParts = [
      addr?.bno,
      addr?.bnm,
      addr?.flno,
      addr?.st,
      addr?.loc,
      addr?.locality,
      addr?.landMark,
      addr?.dst
    ].filter(part => part && part.trim() !== '');
    
    const fullAddress = addressParts.join(', ');

    const transformedData = {
      gstin: data.gstin,
      legalName: data.lgnm,
      tradeName: data.tradeNam,
      registrationDate: data.rgdt,
      constitutionOfBusiness: data.ctb,
      taxpayerType: data.dty,
      gstinStatus: data.sts,
      lastUpdatedDate: data.lstupdt,
      natureOfBusiness: data.nba,
      principalPlaceOfBusiness: {
        address: fullAddress,
        state: addr?.stcd || '',
        pincode: addr?.pncd || '',
        district: addr?.dst || '',
        location: addr?.loc || '',
        street: addr?.st || '',
        buildingNumber: addr?.bno || '',
        buildingName: addr?.bnm || '',
        floorNumber: addr?.flno || '',
        landmark: addr?.landMark || ''
      },
      additionalPlacesOfBusiness: data.adadr,
      jurisdiction: {
        state: data.stj,
        stateCode: data.stjCd,
        center: data.ctj,
        centerCode: data.ctjCd
      },
      einvoiceStatus: data.einvoiceStatus,
      cancellationDate: data.cxdt,
      // Raw data for debugging
      rawData: data
    };

    return NextResponse.json({
      success: true,
      isValid: true,
      gstin: cleanGstin,
      data: transformedData,
      source: 'GST Verification Service',
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('GST API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch GST data',
        source: 'GST Verification Service'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gstin = searchParams.get('gstin');

  if (!gstin) {
    return NextResponse.json(
      { error: 'GST number is required as query parameter' },
      { status: 400 }
    );
  }

  // Reuse POST logic
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ gstin })
  }));
} 