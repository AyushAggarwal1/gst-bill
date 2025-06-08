// GST API Configuration
// Configuration for GST verification service

export interface GSTData {
  gstin: string;
  legalName: string;
  tradeName: string;
  registrationDate: string;
  constitutionOfBusiness: string;
  taxpayerType: string;
  gstinStatus: string;
  lastUpdatedDate: string;
  natureOfBusiness: string[];
  principalPlaceOfBusiness: {
    address: string;
    state: string;
    pincode: string;
    district: string;
    location: string;
    street: string;
    buildingNumber: string;
    buildingName: string;
    floorNumber: string;
    landmark: string;
  };
  additionalPlacesOfBusiness: any[];
  jurisdiction: {
    state: string;
    stateCode: string;
    center: string;
    centerCode: string;
  };
  einvoiceStatus: string;
  cancellationDate: string;
}

export interface GSTAPIResponse {
  success: boolean;
  data?: GSTData;
  error?: string;
}

export class GSTAPI {
  private static readonly BASE_URL = 'https://blog-backend.mastersindia.co';
  private static readonly UNIQUE_ID = 'dlfmlvcC6BhEkStrgbKdeLthGnZqQ1';

  /**
   * Fetch GST data from third-party API
   */
  static async fetchGSTData(gstin: string): Promise<GSTAPIResponse> {
    try {
      const cleanGstin = gstin.replace(/\s/g, '').toUpperCase();
      const apiUrl = `${this.BASE_URL}/api/v1/custom/search/gstin/?keyword=${cleanGstin}&unique_id=${this.UNIQUE_ID}`;
      
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
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();

      if (!apiData.success || !apiData.data) {
        return {
          success: false,
          error: 'GST number not found or invalid'
        };
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

             const transformedData: GSTData = {
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
        cancellationDate: data.cxdt
      };

      return {
        success: true,
        data: transformedData
      };

    } catch (error) {
      console.error('GST API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch GST data'
      };
    }
  }
} 