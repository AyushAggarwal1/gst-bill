# How to Get Firm/Business Name Using GST Number

Getting the firm or business name from a GST number requires **online verification** through GST portal APIs or third-party services. The GSTIN format validation alone cannot provide business names - it only extracts structural information.

## 🎯 **Quick Answer**

To get business names from GST numbers, you need to use:

1. **Official GST Portal** (free but manual)
2. **Third-party APIs** (paid but automated)
3. **Your implemented solution** (using the APIs we've built)

## 🔍 **Available Methods**

### **Method 1: Official GST Portal (Free)**

**Steps:**
1. Visit [www.gst.gov.in](https://www.gst.gov.in)
2. Click "Search Taxpayer" → "Search by GSTIN/UIN"
3. Enter the 15-digit GSTIN
4. Get business details including legal name

**What you get:**
- Legal business name
- Trade name (if different)
- Business address
- Registration date
- Business type
- Status (Active/Inactive)

**Limitations:**
- Manual process (one at a time)
- No API access for automation
- Rate limited

### **Method 2: Third-Party APIs (Recommended)**

We've integrated several active providers in your system:

#### **A. KnowYourGST API** ⭐ (Most Reliable)

**Pricing:** Starting from ₹2,500 for unlimited calls
**Features:**
- Legal name and trade name
- Complete address details
- Registration date and status
- Business type and entity type

**Usage in your app:**
```typescript
const response = await fetch('/api/gst/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gstin: '27AAACI1681G1Z0',
    provider: 'knowyourgst',
    apiKey: 'your-api-key'
  })
});

const data = await response.json();
console.log(data.legalName); // "EXAMPLE COMPANY PRIVATE LIMITED"
console.log(data.tradeName); // "EXAMPLE COMPANY"
```

#### **B. Cashfree GST Verification** ⭐ (Enterprise Grade)

**Features:**
- Highly reliable and fast
- Detailed business information
- Good for high-volume verification

**Usage in your app:**
```typescript
const response = await fetch('/api/gst/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gstin: '27AAACI1681G1Z0',
    provider: 'cashfree',
    apiKey: 'client_id:client_secret' // Both required
  })
});

const data = await response.json();
console.log(data.legalName); // Business legal name
console.log(data.address); // Complete business address
```

#### **C. Decentro API** (Comprehensive)

**Features:**
- Detailed business intelligence
- Director/partner information
- Filing history
- Downloadable PDF reports

**Usage in your app:**
```typescript
const response = await fetch('/api/gst/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gstin: '27AAACI1681G1Z0',
    provider: 'decentro',
    apiKey: 'your-api-key'
  })
});
```

### **Method 3: Using Your React Components**

You can use the components we've built:

```tsx
import GSTValidator from '@/components/GSTValidator';

function VendorForm() {
  const handleValidation = (result) => {
    if (result.isValid) {
      console.log('Business Name:', result.legalName);
      console.log('Trade Name:', result.tradeName);
      console.log('Address:', result.address);
      console.log('Status:', result.status);
    }
  };

  return (
    <GSTValidator
      onValidation={handleValidation}
      enableOnlineVerification={true}
      apiKey="your-api-key"
      provider="knowyourgst"
      showBusinessInfo={true}
    />
  );
}
```

## 📋 **What Information You Can Get**

When you verify a GST number online, you typically get:

### **Basic Information**
- ✅ **Legal Name** - Official registered business name
- ✅ **Trade Name** - Business operating name (if different)
- ✅ **GSTIN Status** - Active, Suspended, Cancelled
- ✅ **Registration Date** - When GST was registered
- ✅ **Business Type** - Private Limited, Partnership, etc.

### **Address Details**
- ✅ **Principal Place of Business** - Main office address
- ✅ **State and Jurisdiction** - Tax jurisdiction details
- ✅ **Pincode and Location** - Complete address

### **Advanced Information** (Provider dependent)
- ✅ **Director/Partner Details** - Key personnel information
- ✅ **Filing History** - GST return filing status
- ✅ **Turnover Information** - Annual business turnover
- ✅ **Nature of Business** - Business activities description

## 🚀 **Quick Implementation Guide**

### **Step 1: Choose Your Provider**

For getting business names, I recommend:

1. **KnowYourGST** - Best value for money, reliable
2. **Cashfree** - Enterprise-grade, very reliable
3. **Decentro** - Most comprehensive information

### **Step 2: Get API Credentials**

**For KnowYourGST:**
1. Visit [knowyourgst.com](https://www.knowyourgst.com)
2. Sign up for developer account
3. Get 50 free API calls for trial
4. Purchase plan starting from ₹2,500

**For Cashfree:**
1. Visit [cashfree.com](https://www.cashfree.com)
2. Sign up for verification services
3. Get client ID and client secret
4. Start with free trial credits

### **Step 3: Test in Your App**

Visit `/gst-demo` in your application and test with these sample GSTINs:

```
27AAACI1681G1Z0 - Valid Maharashtra GSTIN
09AAACI1681G1Z5 - Valid Uttar Pradesh GSTIN
29AAACI1681G1Z8 - Valid Karnataka GSTIN
```

### **Step 4: Integrate in Your Forms**

```tsx
import { useGSTValidation } from '@/hooks/useGSTValidation';

function CustomerOnboarding() {
  const {
    gstin,
    setGstin,
    validationResult,
    validate,
    isValid
  } = useGSTValidation({
    enableOnlineVerification: true,
    apiKey: 'your-api-key',
    provider: 'knowyourgst'
  });

  return (
    <div>
      <input
        value={gstin}
        onChange={(e) => setGstin(e.target.value)}
        placeholder="Enter customer GSTIN"
      />
      <button onClick={validate}>Verify & Get Business Name</button>
      
      {isValid && validationResult && (
        <div>
          <h3>Business Details:</h3>
          <p><strong>Legal Name:</strong> {validationResult.legalName}</p>
          <p><strong>Trade Name:</strong> {validationResult.tradeName}</p>
          <p><strong>Address:</strong> {validationResult.address}</p>
          <p><strong>Status:</strong> {validationResult.status}</p>
        </div>
      )}
    </div>
  );
}
```

## 💡 **Best Practices**

### **1. Cache Results**
Store verification results to avoid repeated API calls:

```typescript
// Store in localStorage or database
localStorage.setItem(`gst_${gstin}`, JSON.stringify(result));
```

### **2. Handle Errors Gracefully**
```typescript
if (!result.isValid) {
  console.log('Verification failed:', result.errors);
  // Fallback to format validation only
}
```

### **3. Validate Before API Calls**
Always do format validation first to avoid unnecessary API costs:

```typescript
import { validateGSTINFormat } from '@/lib/gst-validator';

const formatCheck = validateGSTINFormat(gstin);
if (!formatCheck.isValid) {
  // Don't make API call for invalid format
  return;
}
```

### **4. Bulk Processing**
For multiple GSTINs, use bulk verification:

```typescript
const gstNumbers = ['27AAACI1681G1Z0', '09AAACI1681G1Z5'];
const results = await Promise.all(
  gstNumbers.map(gstin => 
    fetch('/api/gst/verify', {
      method: 'POST',
      body: JSON.stringify({ gstin, provider: 'knowyourgst', apiKey })
    }).then(r => r.json())
  )
);
```

## 🔧 **Troubleshooting**

### **Common Issues:**

**1. "GSTIN not found"**
- GSTIN might be cancelled or suspended
- Check GSTIN format first

**2. "API key invalid"**
- Verify your API credentials
- Check if you have sufficient credits

**3. "Rate limit exceeded"**
- Implement delays between requests
- Consider upgrading your plan

**4. "Network timeout"**
- Implement retry logic
- Add proper error handling

## 📊 **Cost Comparison**

| Provider | Free Trial | Paid Plans | Best For |
|----------|------------|------------|----------|
| **KnowYourGST** | 50 calls | ₹2,500+ unlimited | Small to medium businesses |
| **Cashfree** | ₹100 credits | Pay per use | Enterprise applications |
| **Decentro** | Free credits | Custom pricing | Detailed business intelligence |
| **Official Portal** | Free | Free (manual only) | Occasional verification |

## 🎯 **Recommendation**

For your GST bill application, I recommend:

1. **Start with KnowYourGST** - Good balance of features and cost
2. **Use format validation first** - Reduce API costs
3. **Cache results** - Avoid duplicate API calls
4. **Implement error handling** - Graceful fallbacks

The system is already set up in your application. You just need to:
1. Get API credentials from your chosen provider
2. Test using the `/gst-demo` page
3. Integrate into your customer/vendor forms

Would you like me to help you set up any specific provider or integrate this into your existing forms? 