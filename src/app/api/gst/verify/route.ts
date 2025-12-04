import { NextRequest, NextResponse } from 'next/server';

interface GSTAPIProviderResponse {
  success: boolean;
  // Provider responses have inconsistent shapes:
  // - An array of records
  // - An object containing rawData: Record[]
  // - A single record object
  // Use any here and normalize at runtime below.
  data?: any;
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
    const apiUrl = `https://blog-backend.mastersindia.co/api/v1/custom/search/name_and_pan/?keyword=${cleanGstin}&unique_id=dlfmlvcC6BhEkStrgbKdeLthGnZqQ1`;
    
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
    // console.log(response);

          if (!response.ok) {
        throw new Error(`GST API error: ${response.status} ${response.statusText}`);
      }

    const apiData: GSTAPIProviderResponse = await response.json();
    // console.log(apiData);
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

    // Normalize provider data to a single record shape
    const providerData: any = apiData.data;
    let record: any | null = null;
    if (Array.isArray(providerData)) {
      record = providerData[0] ?? null;
    } else if (providerData && Array.isArray(providerData.rawData)) {
      record = providerData.rawData[0] ?? null;
    } else if (providerData && typeof providerData === 'object') {
      record = providerData;
    }

    if (!record) {
      return NextResponse.json(
        {
          error: 'GST record not found',
          gstin: cleanGstin,
          isValid: false
        },
        { status: 404 }
      );
    }

    // Transform the record to our standard format
    
    // Build complete address
    const addr = record.pradr?.addr;
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
      gstin: record.gstin,
      legalName: record.lgnm,
      tradeName: record.tradeNam,
      registrationDate: record.rgdt,
      constitutionOfBusiness: record.ctb,
      taxpayerType: record.dty,
      gstinStatus: record.sts,
      lastUpdatedDate: record.lstupdt,
      natureOfBusiness: record.nba,
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
      additionalPlacesOfBusiness: record.adadr,
      jurisdiction: {
        state: record.stj,
        stateCode: record.stjCd,
        center: record.ctj,
        centerCode: record.ctjCd
      },
      einvoiceStatus: record.einvoiceStatus,
      cancellationDate: record.cxdt,
      // Raw data for debugging; always return an array for consistency
      rawData: Array.isArray(providerData)
        ? providerData
        : Array.isArray(providerData?.rawData)
          ? providerData.rawData
          : record
            ? [record]
            : []
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