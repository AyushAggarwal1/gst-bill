# GST Verification API Integration

This project integrates with a third-party GST verification API to validate GST numbers and retrieve detailed business information.

## Features

- ✅ Real-time GST number validation
- ✅ Detailed business information retrieval
- ✅ Address parsing and formatting
- ✅ Jurisdiction details (state and center)
- ✅ E-invoice status checking
- ✅ Registration and update date tracking

## API Endpoint

### Validate GST Number

**POST** `/api/gst/verify`

**Request Body:**
```json
{
  "gstin": "23ACQPA5175N1ZA"
}
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "gstin": "23ACQPA5175N1ZA",
  "data": {
    "gstin": "23ACQPA5175N1ZA",
    "legalName": "MANISH AGRAWAL",
    "tradeName": "MANISH INDUSTRIES",
    "registrationDate": "01/07/2017",
    "constitutionOfBusiness": "Proprietorship",
    "taxpayerType": "Regular",
    "gstinStatus": "Active",
    "lastUpdatedDate": "16/04/2025",
    "natureOfBusiness": ["Factory / Manufacturing"],
    "principalPlaceOfBusiness": {
      "address": "155 TO 157 AND 172 TO 174, UDYOG VIHAR, INDUSTRIAL AREA, CHORHATA, Rewa",
      "state": "Madhya Pradesh",
      "pincode": "486006",
      "district": "Rewa"
    },
    "jurisdiction": {
      "state": "Rewa",
      "stateCode": "MP066",
      "center": "RANGE-II REWA",
      "centerCode": "UK0602"
    },
    "einvoiceStatus": "Yes"
  },
  "source": "GST Verification Service",
  "retrievedAt": "2024-01-15T10:30:00.000Z"
}
```

## Demo Page

Visit `/search-gst` to test the API integration with an interactive interface.

## Usage

### Basic Validation
```javascript
const response = await fetch('/api/gst/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ gstin: '23ACQPA5175N1ZA' })
});

const data = await response.json();
if (data.success) {
  console.log('Business Name:', data.data.legalName);
  console.log('Status:', data.data.gstinStatus);
}
```

### Using the Utility Class
```javascript
import { GSTUtils } from '@/lib/gst-utils';

// Basic format validation
const info = GSTUtils.extractGSTInfo('23ACQPA5175N1ZA');
if (info.isValid) {
  console.log('State:', info.stateName);
  console.log('Entity Type:', info.entityType);
}

// Format GST number
const formatted = GSTUtils.formatGSTIN('23ACQPA5175N1ZA');
// Output: "23 ACQPA 5175 N 1 ZA"
```

## Files Structure

```
src/
├── app/
│   ├── api/gst/verify/route.ts          # API endpoint
│   └── search-gst/page.tsx              # Demo page
├── lib/
│   ├── gst-utils.ts                     # GST validation utilities
│   └── gst-api-config.ts                # GST API client
```

## Sample GST Numbers for Testing

- `23ACQPA5175N1ZA` - Madhya Pradesh (Proprietorship)
- `27AAACI1681G1Z0` - Maharashtra
- `09AAACI1681G1Z5` - Uttar Pradesh
- `07AAACI1681G1Z8` - Delhi
- `29AAACI1681G1Z3` - Karnataka

## Error Handling

The API handles various error scenarios:

- Invalid GST format
- GST number not found
- API service unavailable
- Network errors

All errors are returned in a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "source": "GST Verification Service"
}
```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the demo page:
   ```
   http://localhost:3000/search-gst
   ```

3. Test the API directly:
   ```bash
   curl -X POST http://localhost:3000/api/gst/verify \
     -H "Content-Type: application/json" \
     -d '{"gstin": "23ACQPA5175N1ZA"}'
   