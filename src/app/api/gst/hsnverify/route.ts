import { NextRequest, NextResponse } from 'next/server';

interface HSNItem {
  hsn_code: string;
  description: string;
  type: string;
  gst: string;
  irt: string;
  crt: string;
  srt: string;
  cess: string;
  nn: number;
}

interface HSNAPIResponse {
  success: boolean;
  data?: HSNItem[];
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: 'HSN code or item name is required' },
        { status: 400 }
      );
    }

    // Clean the keyword
    const cleanKeyword = keyword.trim();

    // Call MastersIndia HSN API
    const apiUrl = `https://blog-backend.mastersindia.co/api/v1/custom/search/hsn_and_rate/?keyword=${encodeURIComponent(cleanKeyword)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-GB,en;q=0.9',
        'dnt': '1',
        'origin': 'https://www.mastersindia.co',
        'priority': 'u=1, i',
        'referer': 'https://www.mastersindia.co/hsn-code-search/',
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
      throw new Error(`HSN API error: ${response.status} ${response.statusText}`);
    }

    const apiData: HSNAPIResponse = await response.json();

    if (!apiData.success || !apiData.data || apiData.data.length === 0) {
      return NextResponse.json(
        { 
          error: 'No HSN codes found for the given keyword',
          keyword: cleanKeyword,
          success: false
        },
        { status: 404 }
      );
    }

    // Transform the response to include additional computed fields
    const transformedData = apiData.data.map(item => ({
      hsnCode: item.hsn_code,
      description: item.description,
      type: item.type === 'G' ? 'Goods' : 'Services',
      gstRate: parseFloat(item.gst),
      integratedTax: parseFloat(item.irt),
      centralTax: parseFloat(item.crt),
      stateTax: parseFloat(item.srt),
      cess: item.cess || 'N/A',
      notificationNumber: item.nn,
      // Raw data for reference
      rawData: item
    }));

    return NextResponse.json({
      success: true,
      keyword: cleanKeyword,
      totalResults: transformedData.length,
      data: transformedData,
      source: 'HSN Code Search Service',
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('HSN API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch HSN data',
        source: 'HSN Code Search Service'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json(
      { error: 'HSN code or item name is required as query parameter' },
      { status: 400 }
    );
  }

  // Reuse POST logic
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ keyword })
  }));
} 