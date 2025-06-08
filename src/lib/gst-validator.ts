// GST Validation Utility
export interface GSTINInfo {
  isValid: boolean;
  stateCode?: string;
  stateName?: string;
  panNumber?: string;
  entityNumber?: string;
  checksum?: string;
  errors?: string[];
}

export interface GSTVerificationResponse {
  isValid: boolean;
  gstin?: string;
  legalName?: string;
  tradeName?: string;
  registrationDate?: string;
  status?: string;
  businessType?: string;
  address?: string;
  errors?: string[];
  verificationMethod?: string;
  message?: string;
  stateCode?: string;
  stateName?: string;
  panNumber?: string;
  entityNumber?: string;
  checksum?: string;
}

// State codes mapping
const STATE_CODES: { [key: string]: string } = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh'
};

/**
 * Validates GSTIN format and structure
 */
export function validateGSTINFormat(gstin: string): GSTINInfo {
  const errors: string[] = [];
  
  if (!gstin) {
    errors.push('GSTIN is required');
    return { isValid: false, errors };
  }

  // Remove spaces and convert to uppercase
  const cleanGSTIN = gstin.replace(/\s/g, '').toUpperCase();

  // Check length
  if (cleanGSTIN.length !== 15) {
    errors.push('GSTIN must be exactly 15 characters long');
  }

  // Check format using regex
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleanGSTIN)) {
    errors.push('Invalid GSTIN format');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Extract components
  const stateCode = cleanGSTIN.substring(0, 2);
  const panNumber = cleanGSTIN.substring(2, 12);
  const entityNumber = cleanGSTIN.substring(12, 13);
  const checksum = cleanGSTIN.substring(14, 15);

  // Validate state code
  const stateName = STATE_CODES[stateCode];
  if (!stateName) {
    errors.push('Invalid state code');
  }

  // Validate checksum
  if (!validateGSTINChecksum(cleanGSTIN)) {
    errors.push('Invalid checksum');
  }

  return {
    isValid: errors.length === 0,
    stateCode,
    stateName,
    panNumber,
    entityNumber,
    checksum,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Validates GSTIN checksum using the official algorithm
 */
function validateGSTINChecksum(gstin: string): boolean {
  const codePoint = (char: string): number => {
    if (char >= '0' && char <= '9') {
      return char.charCodeAt(0) - '0'.charCodeAt(0);
    }
    if (char >= 'A' && char <= 'Z') {
      return char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    }
    return 0;
  };

  const mod = 36;
  let factor = 2;
  let sum = 0;
  let checkCodePoint = 0;

  // Process first 14 characters
  for (let i = gstin.length - 2; i >= 0; i--) {
    let codePoint_1 = codePoint(gstin[i]);
    let addend = factor * codePoint_1;
    factor = factor === 2 ? 1 : 2;
    addend = Math.floor(addend / mod) + (addend % mod);
    sum += addend;
  }

  checkCodePoint = (mod - (sum % mod)) % mod;
  
  const checkChar = checkCodePoint < 10 
    ? String.fromCharCode(checkCodePoint + '0'.charCodeAt(0))
    : String.fromCharCode(checkCodePoint - 10 + 'A'.charCodeAt(0));

  return gstin[gstin.length - 1] === checkChar;
}

/**
 * Validates GSTIN using online verification (requires API key)
 */
export async function verifyGSTINOnline(gstin: string, apiKey?: string): Promise<GSTVerificationResponse> {
  try {
    // First validate format
    const formatValidation = validateGSTINFormat(gstin);
    if (!formatValidation.isValid) {
      return {
        isValid: false,
        errors: formatValidation.errors
      };
    }

    // If no API key provided, return format validation only
    if (!apiKey) {
      return {
        isValid: true,
        gstin: gstin.replace(/\s/g, '').toUpperCase(),
        errors: ['Online verification requires API key - only format validation performed']
      };
    }

    // Call third-party verification service
    const response = await fetch(`/api/gst/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gstin, apiKey })
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    return {
      isValid: false,
      errors: [`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Utility function to format GSTIN for display
 */
export function formatGSTIN(gstin: string): string {
  const clean = gstin.replace(/\s/g, '').toUpperCase();
  if (clean.length !== 15) return gstin;
  
  return `${clean.substring(0, 2)} ${clean.substring(2, 7)} ${clean.substring(7, 11)} ${clean.substring(11, 12)} ${clean.substring(12, 13)} ${clean.substring(13, 14)} ${clean.substring(14, 15)}`;
}

/**
 * Extract business information from GSTIN
 */
export function getGSTINBusinessInfo(gstin: string): {
  stateCode: string;
  stateName: string;
  panNumber: string;
  entityType: string;
  registrationSequence: string;
} | null {
  const validation = validateGSTINFormat(gstin);
  if (!validation.isValid) return null;

  const clean = gstin.replace(/\s/g, '').toUpperCase();
  
  return {
    stateCode: validation.stateCode!,
    stateName: validation.stateName!,
    panNumber: validation.panNumber!,
    entityType: getEntityType(clean.substring(12, 13)),
    registrationSequence: clean.substring(13, 14)
  };
}

function getEntityType(code: string): string {
  const entityTypes: { [key: string]: string } = {
    '1': 'Company',
    '2': 'Company',
    '3': 'Company',
    '4': 'Partnership Firm',
    '5': 'AOP/BOI',
    '6': 'HUF',
    '7': 'Individual',
    '8': 'Trust',
    '9': 'Society',
    'A': 'Government',
    'B': 'Public Sector Undertaking',
    'C': 'Statutory Body',
    'D': 'Foreign Company',
    'E': 'Foreign LLP',
    'F': 'Non Resident Indian',
    'G': 'Other'
  };
  
  return entityTypes[code] || 'Unknown';
} 