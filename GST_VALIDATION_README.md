# GST Number Validation

This project includes comprehensive GST (Goods and Services Tax) number validation functionality for Indian businesses. It provides both client-side format validation and optional online verification through third-party APIs.

## Features

### Format Validation (Client-side)
- ✅ 15-digit GSTIN format validation
- ✅ State code verification (all 38 Indian states/UTs)
- ✅ Checksum validation using official algorithm
- ✅ Entity type extraction
- ✅ PAN number extraction
- ✅ No API key required
- ✅ Works offline

### Online Verification (Server-side)
- ✅ Real-time GSTIN verification
- ✅ Business name retrieval
- ✅ Registration status check
- ✅ Address information
- ✅ Multiple provider support
- ⚠️ Requires API key from verification provider

## Quick Start

### 1. Basic Format Validation

```typescript
import { validateGSTINFormat } from '@/lib/gst-validator';

const result = validateGSTINFormat('27AAACI1681G1Z0');
console.log(result);
// {
//   isValid: true,
//   stateCode: '27',
//   stateName: 'Maharashtra',
//   panNumber: 'AAACI1681G',
//   entityNumber: '1',
//   checksum: '0'
// }
```

### 2. Using the React Component

```tsx
import GSTValidator from '@/components/GSTValidator';

function MyComponent() {
  const handleValidation = (result) => {
    console.log('Validation result:', result);
  };

  return (
    <GSTValidator
      onValidation={handleValidation}
      showBusinessInfo={true}
      enableOnlineVerification={false}
    />
  );
}
```

### 3. Using the Custom Hook

```tsx
import { useGSTValidation } from '@/hooks/useGSTValidation';

function MyForm() {
  const {
    gstin,
    setGstin,
    validationResult,
    isValidating,
    validate,
    isValid,
    errors
  } = useGSTValidation({
    autoValidate: true
  });

  return (
    <div>
      <input
        value={gstin}
        onChange={(e) => setGstin(e.target.value)}
        placeholder="Enter GSTIN"
      />
      <button onClick={validate} disabled={isValidating}>
        Validate
      </button>
      {isValid && <p>✅ Valid GSTIN</p>}
      {errors.length > 0 && <p>❌ {errors[0]}</p>}
    </div>
  );
}
```

## API Endpoints

### GET /api/gst/verify

Format validation only (no API key required):

```bash
curl "http://localhost:3000/api/gst/verify?gstin=27AAACI1681G1Z0"
```

Response:
```json
{
  "isValid": true,
  "gstin": "27AAACI1681G1Z0",
  "stateCode": "27",
  "stateName": "Maharashtra",
  "panNumber": "AAACI1681G",
  "entityNumber": "1",
  "checksum": "0",
  "verificationMethod": "format-validation-only"
}
```

### POST /api/gst/verify

Online verification with third-party services:

```bash
curl -X POST "http://localhost:3000/api/gst/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "gstin": "27AAACI1681G1Z0",
    "provider": "gstincheck",
    "apiKey": "your-api-key"
  }'
```

Response:
```json
{
  "isValid": true,
  "gstin": "27AAACI1681G1Z0",
  "legalName": "Example Company Pvt Ltd",
  "tradeName": "Example Company",
  "registrationDate": "2017-07-01",
  "status": "Active",
  "businessType": "Private Limited Company",
  "address": "123 Business Street, Mumbai, Maharashtra",
  "verificationMethod": "gstincheck-api"
}
```

## GSTIN Format

A valid GSTIN follows this 15-character format:

```
XX AAAAA NNNN A N Z C
```

Where:
- **XX**: 2-digit state code (01-38)
- **AAAAA**: 5-character PAN prefix
- **NNNN**: 4-digit PAN sequence
- **A**: 1-character PAN check digit
- **N**: 1-digit entity number (1-9, A-Z)
- **Z**: Always 'Z'
- **C**: 1-character checksum

### Examples of Valid GSTINs

| GSTIN | State | Description |
|-------|-------|-------------|
| `27AAACI1681G1Z0` | Maharashtra | Private Company |
| `09AAACI1681G1Z5` | Uttar Pradesh | Private Company |
| `29AAACI1681G1Z8` | Karnataka | Private Company |
| `06AAACI1681G4Z2` | Haryana | Partnership Firm |
| `07AAACI1681G7Z9` | Delhi | Individual |

## State Codes

| Code | State/UT |
|------|----------|
| 01 | Jammu and Kashmir |
| 02 | Himachal Pradesh |
| 03 | Punjab |
| 04 | Chandigarh |
| 05 | Uttarakhand |
| 06 | Haryana |
| 07 | Delhi |
| 08 | Rajasthan |
| 09 | Uttar Pradesh |
| 10 | Bihar |
| ... | [See full list in code] |
| 36 | Telangana |
| 37 | Andhra Pradesh (New) |
| 38 | Ladakh |

## Entity Types

| Code | Entity Type |
|------|-------------|
| 1-3 | Company |
| 4 | Partnership Firm |
| 5 | AOP/BOI |
| 6 | HUF |
| 7 | Individual |
| 8 | Trust |
| 9 | Society |
| A | Government |
| B | Public Sector Undertaking |
| C | Statutory Body |
| D | Foreign Company |
| E | Foreign LLP |
| F | Non Resident Indian |
| G | Other |

## Online Verification Providers

### 1. GSTINCheck.co.in (Third-party)

**Setup:**
1. Visit [gstincheck.co.in](https://gstincheck.co.in)
2. Sign up for an API key
3. Get 20 free credits to start

**Usage:**
```typescript
const result = await verifyGSTINOnline('27AAACI1681G1Z0', 'your-api-key');
```

**Note:** This service is no longer accepting new API purchases as of the documentation date.

### 2. Official GST Portal API

**Requirements:**
- GSP (GST Suvidha Provider) credentials
- Proper authentication setup
- Business registration

**Status:** Implementation placeholder provided - requires proper GSP setup.

## Integration Examples

### Customer Form Validation

```tsx
import { useGSTValidation } from '@/hooks/useGSTValidation';

function CustomerForm() {
  const gstValidation = useGSTValidation({ autoValidate: true });
  
  return (
    <form>
      <div>
        <label>Customer GSTIN</label>
        <input
          value={gstValidation.gstin}
          onChange={(e) => gstValidation.setGstin(e.target.value)}
          className={gstValidation.isValid ? 'valid' : 'invalid'}
        />
        {gstValidation.validationResult?.stateName && (
          <p>State: {gstValidation.validationResult.stateName}</p>
        )}
      </div>
    </form>
  );
}
```

### Bulk Validation

```typescript
import { validateGSTINFormat } from '@/lib/gst-validator';

const gstNumbers = ['27AAACI1681G1Z0', '09AAACI1681G1Z5', 'invalid'];

const results = gstNumbers.map(gstin => ({
  gstin,
  ...validateGSTINFormat(gstin)
}));

console.log(results);
```

### API Integration in Forms

```typescript
async function validateCustomerGST(gstin: string) {
  const response = await fetch('/api/gst/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gstin,
      provider: 'format-only'
    })
  });
  
  return await response.json();
}
```

## Error Handling

Common validation errors:

```typescript
{
  isValid: false,
  errors: [
    "GSTIN must be exactly 15 characters long",
    "Invalid GSTIN format",
    "Invalid state code",
    "Invalid checksum"
  ]
}
```

## Performance Considerations

### Client-side Validation
- ✅ Instant validation
- ✅ No network requests
- ✅ Works offline
- ✅ No rate limits

### Online Verification
- ⚠️ Network dependent
- ⚠️ API rate limits apply
- ⚠️ Costs per verification
- ⚠️ Requires error handling

### Recommendations

1. **Always use format validation first** - catch obvious errors without API calls
2. **Implement caching** - store verification results to avoid duplicate API calls
3. **Add rate limiting** - prevent abuse of your API endpoints
4. **Handle failures gracefully** - fallback to format validation if online verification fails

## Testing

### Test GSTINs

Use these for testing (format validation only):

```typescript
const testCases = [
  { gstin: '27AAACI1681G1Z0', expected: true },  // Valid Maharashtra
  { gstin: '09AAACI1681G1Z5', expected: true },  // Valid UP
  { gstin: '29AAACI1681G1Z8', expected: true },  // Valid Karnataka
  { gstin: '99AAACI1681G1Z0', expected: false }, // Invalid state
  { gstin: '27AAACI1681G1Z1', expected: false }, // Invalid checksum
  { gstin: '12345678901234', expected: false },   // Wrong format
];
```

### Demo Page

Visit `/gst-demo` to see the validation in action with:
- Interactive validation form
- Sample GSTIN numbers
- API documentation
- Real-time validation results

## Security Notes

1. **API Keys**: Never expose API keys in client-side code
2. **Rate Limiting**: Implement rate limiting on your API endpoints
3. **Input Sanitization**: Always validate and sanitize GSTIN inputs
4. **Error Messages**: Don't expose internal system details in error messages

## Dependencies

- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS (for styling)

## License

This GST validation implementation is part of the GST Bill project and follows the same license terms. 