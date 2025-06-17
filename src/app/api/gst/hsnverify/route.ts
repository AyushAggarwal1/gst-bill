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

interface CleartaxHSNItem {
  hsn_code: string;
  description: string;
  gst_rate: number;
  type: string;
}

interface CleartaxAPIResponse {
  results: Array<{
    hits: CleartaxHSNItem[];
  }>;
}

async function searchCleartaxHSN(keyword: string): Promise<CleartaxHSNItem[]> {
  const response = await fetch('https://cleartax.in/f/content_search/algolia/algolia-search/', {
    method: 'POST',
    headers: {
      'accept': 'application/json, text/plain, */*',
      'content-type': 'application/json',
      'origin': 'https://cleartax.in',
      'referer': 'https://cleartax.in/s/gst-hsn-lookup',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    },
    body: JSON.stringify({
      requests: [{
        indexName: "HSN_SAC_2021",
        params: `query=${encodeURIComponent(keyword)}&optionalWords=${encodeURIComponent(keyword)}&highlightPreTag=<strong>&highlightPostTag=</strong>&typoTolerance=false`
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Cleartax API error: ${response.status} ${response.statusText}`);
  }

  const data: CleartaxAPIResponse = await response.json();
  return data.results[0]?.hits || [];
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

    let transformedData;
    let source = 'MastersIndia HSN Code Search';

    if (!apiData.success || !apiData.data || apiData.data.length === 0) {
      // Try Cleartax API as fallback
      const cleartaxResults = await searchCleartaxHSN(cleanKeyword);
      
      if (cleartaxResults.length === 0) {
        return NextResponse.json(
          { 
            error: 'No HSN codes found for the given keyword',
            keyword: cleanKeyword,
            success: false
          },
          { status: 404 }
        );
      }

      source = 'Cleartax HSN Code Search';
      transformedData = cleartaxResults.map(item => ({
        hsnCode: item.hsn_code,
        description: item.description,
        type: item.type,
        gstRate: item.gst_rate,
        integratedTax: item.gst_rate,
        centralTax: item.gst_rate / 2,
        stateTax: item.gst_rate / 2,
        cess: 'N/A',
        notificationNumber: 0,
        rawData: item
      }));
    } else {
      transformedData = apiData.data.map(item => ({
        hsnCode: item.hsn_code,
        description: item.description,
        type: item.type === 'G' ? 'Goods' : 'Services',
        gstRate: parseFloat(item.gst),
        integratedTax: parseFloat(item.irt),
        centralTax: parseFloat(item.crt),
        stateTax: parseFloat(item.srt),
        cess: item.cess || 'N/A',
        notificationNumber: item.nn,
        rawData: item
      }));
    }

    return NextResponse.json({
      success: true,
      keyword: cleanKeyword,
      totalResults: transformedData.length,
      data: transformedData,
      source,
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