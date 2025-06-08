// GST Utilities for Third-Party API Integration
// Basic GST validation and utility functions

export interface GSTInfo {
  isValid: boolean;
  stateCode: string;
  stateName: string;
  panNumber: string;
  entityNumber: string;
  checkDigit: string;
  entityType: string;
  errors: string[];
}

export class GSTUtils {
  // State code to state name mapping
  private static readonly STATE_CODES: Record<string, string> = {
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
    '37': 'Andhra Pradesh',
    '38': 'Ladakh'
  };

  // Entity type mapping based on 5th character
  private static readonly ENTITY_TYPES: Record<string, string> = {
    'A': 'Association of Persons',
    'B': 'Body of Individuals',
    'C': 'Company',
    'F': 'Firm',
    'G': 'Government',
    'H': 'HUF',
    'L': 'Local Authority',
    'J': 'Artificial Juridical Person',
    'P': 'Person',
    'T': 'Trust'
  };

  /**
   * Validates GST number format and extracts information
   */
  static extractGSTInfo(gstin: string): GSTInfo {
    const errors: string[] = [];
    
    // Clean the input
    const cleanGstin = gstin.replace(/\s/g, '').toUpperCase();
    
    // Basic format validation
    if (!cleanGstin) {
      errors.push('GST number is required');
      return {
        isValid: false,
        stateCode: '',
        stateName: '',
        panNumber: '',
        entityNumber: '',
        checkDigit: '',
        entityType: '',
        errors
      };
    }

    if (cleanGstin.length !== 15) {
      errors.push('GST number must be 15 characters long');
    }

    if (!/^[0-9A-Z]+$/.test(cleanGstin)) {
      errors.push('GST number can only contain numbers and uppercase letters');
    }

    // Extract components
    const stateCode = cleanGstin.substring(0, 2);
    const panNumber = cleanGstin.substring(2, 12);
    const entityNumber = cleanGstin.substring(12, 13);
    const checkDigit = cleanGstin.substring(13, 15);

    // Validate state code
    const stateName = GSTUtils.STATE_CODES[stateCode];
    if (!stateName) {
      errors.push(`Invalid state code: ${stateCode}`);
    }

    // Validate PAN format (10 characters: 5 letters, 4 numbers, 1 letter)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) {
      errors.push('Invalid PAN format in GST number');
    }

    // Get entity type
    const entityTypeCode = panNumber.charAt(3);
    const entityType = GSTUtils.ENTITY_TYPES[entityTypeCode] || 'Unknown';

    // Validate entity number
    if (!/^[0-9A-Z]$/.test(entityNumber)) {
      errors.push('Invalid entity number');
    }

    // Validate check digit
    if (!/^[0-9A-Z]{2}$/.test(checkDigit)) {
      errors.push('Invalid check digit');
    }

    // Perform checksum validation
    if (errors.length === 0) {
      const isChecksumValid = GSTUtils.validateChecksum(cleanGstin);
      if (!isChecksumValid) {
        errors.push('Invalid GST checksum');
      }
    }

    return {
      isValid: errors.length === 0,
      stateCode,
      stateName: stateName || '',
      panNumber,
      entityNumber,
      checkDigit,
      entityType,
      errors
    };
  }

  /**
   * Validates GST checksum using the official algorithm
   */
  static validateChecksum(gstin: string): boolean {
    try {
      const factor = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
      const codePointChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      
      let sum = 0;
      for (let i = 0; i < 14; i++) {
        const codePoint = codePointChars.indexOf(gstin[i]);
        if (codePoint === -1) return false;
        
        let digit = factor[i] * codePoint;
        digit = Math.floor(digit / 36) + (digit % 36);
        sum += digit;
      }
      
      const remainder = sum % 36;
      const checkCodePoint = (36 - remainder) % 36;
      const expectedCheckChar = codePointChars[checkCodePoint];
      
      return gstin[14] === expectedCheckChar;
    } catch (error) {
      return false;
    }
  }

  /**
   * Formats GST number with spaces for better readability
   */
  static formatGSTIN(gstin: string): string {
    const clean = gstin.replace(/\s/g, '').toUpperCase();
    if (clean.length !== 15) return clean;
    
    return `${clean.substring(0, 2)} ${clean.substring(2, 7)} ${clean.substring(7, 11)} ${clean.substring(11, 12)} ${clean.substring(12, 13)} ${clean.substring(13, 15)}`;
  }

  /**
   * Gets state name from state code
   */
  static getStateName(stateCode: string): string {
    return GSTUtils.STATE_CODES[stateCode] || 'Unknown State';
  }

  /**
   * Gets entity type from entity type code
   */
  static getEntityType(entityTypeCode: string): string {
    return GSTUtils.ENTITY_TYPES[entityTypeCode] || 'Unknown Entity Type';
  }

  /**
   * Validates if a string is a valid GST number
   */
  static isValidGSTIN(gstin: string): boolean {
    const info = GSTUtils.extractGSTInfo(gstin);
    return info.isValid;
  }
} 