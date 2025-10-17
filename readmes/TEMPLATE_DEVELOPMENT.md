# Template Development Guide

## 📋 Overview

The GST Bill application now supports **dynamic template detection**. Templates are automatically discovered from the `/public/templates/` directory without requiring code changes.

## 🚀 Adding New Templates

### 1. Create Template File

Create a new HTML file in `/public/templates/` with a descriptive filename:

```
/public/templates/yourTemplateName.html
```

### 2. Add Template Metadata

Add metadata comments at the top of your HTML file:

```html
<!-- @template-name: Your Template Name -->
<!-- @template-description: Brief description of your template -->
<!-- @template-category: Category (Optional) -->
<!-- @template-author: Your Name (Optional) -->
<!-- @template-version: 1.0 (Optional) -->
<!DOCTYPE html>
<html>
<head>
  <title>{{COMPANY_NAME}} - Invoice #{{BILL_NUMBER}}</title>
  ...
```

### 3. Template Structure

Your template must include these placeholder variables:

#### Required Placeholders:
- `{{COMPANY_NAME}}` - Company/Business name
- `{{COMPANY_ADDRESS}}` - Company address
- `{{COMPANY_GST}}` - Company GST number
- `{{COMPANY_PHONE}}` - Company phone (optional, can be empty)
- `{{CUSTOMER_NAME}}` - Customer name
- `{{CUSTOMER_ADDRESS}}` - Customer address
- `{{CUSTOMER_GST}}` - Customer GST number
- `{{DELIVERY_ADDRESS}}` - Delivery address (optional, can be empty)
- `{{BILL_NUMBER}}` - Invoice/Bill number
- `{{BILL_DATE}}` - Invoice date
- `{{TAX_TYPE}}` - Tax type (IGST or CGST/SGST)
- `{{ITEMS_TABLE}}` - Items table HTML
- `{{SUBTOTAL}}` - Subtotal amount
- `{{TAX_ROWS}}` - Tax rows HTML
- `{{TOTAL}}` - Total amount
- `{{AMOUNT_IN_WORDS}}` - Total amount in words
- `{{BANK_DETAILS}}` - Bank details section (optional, can be empty)

#### Optional Placeholders:
- `{{PROFILE_PHOTO}}` - Business logo/photo (optional, will be empty if no photo uploaded)

#### Profile Photo Integration:
To include the business logo/photo in your template, add this placeholder where you want the image to appear:

```html
<div class="header-content">
  {{PROFILE_PHOTO}}
  <h1>TAX INVOICE</h1>
</div>
```

The system will automatically replace `{{PROFILE_PHOTO}}` with:
- An `<img>` tag if a photo is uploaded
- Empty string if no photo is uploaded

#### Items Table Structure

The `{{ITEMS_TABLE}}` will be replaced with:
```html
<tr>
  <td class="text-center">1</td>
  <td>Item Name</td>
  <td>HSN Code</td>
  <td class="text-center">Quantity</td>
  <td class="text-right">₹Price</td>
  <td class="text-right">₹Amount</td>
  <td class="text-center">Tax%</td>
  <td class="text-right">₹Tax Amount</td>
</tr>
<!-- More rows... -->
```

#### Tax Rows Structure

The `{{TAX_ROWS}}` will be replaced with either:

**For CGST/SGST:**
```html
<tr>
  <td>CGST (9%):</td>
  <td>₹Amount</td>
</tr>
<tr>
  <td>SGST (9%):</td>
  <td>₹Amount</td>
</tr>
```

**For IGST:**
```html
<tr>
  <td>IGST (18%):</td>
  <td>₹Amount</td>
</tr>
```

### 4. Styling Guidelines

- Use responsive CSS that works on both screen and print
- Include print-specific styles using `@media print`
- Ensure good contrast for professional appearance
- Use web-safe fonts or Google Fonts
- Keep colors minimal and professional

#### Print Styles Example:
```css
@media print {
  @page {
    size: A4;
    margin: 15mm;
  }
  
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .invoice-container {
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }
}
```

#### Profile Photo Styling:
If you include the profile photo, consider these CSS styles:

```css
.profile-photo {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #eee;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
```

## 📂 Template Categories

Organize templates using categories:

- **Standard** - Basic professional templates
- **Modern** - Contemporary designs
- **Corporate** - Enterprise-focused layouts
- **Formal** - Traditional business formats
- **Compact** - Space-efficient designs
- **Professional** - Formal letterhead styles
- **Custom** - User-created templates

## 🔍 Metadata Options

| Field | Required | Description |
|-------|----------|-------------|
| `@template-name` | ✅ | Display name for the template |
| `@template-description` | ✅ | Brief description of the template |
| `@template-category` | ❌ | Category for organization |
| `@template-author` | ❌ | Template creator |
| `@template-version` | ❌ | Version number |

## ✅ Template Validation

The system will:
1. Automatically detect new `.html` files in `/public/templates/`
2. Extract metadata from HTML comments
3. Fall back to filename-based naming if metadata is missing
4. Handle errors gracefully and still include the template

## 🔄 How It Works

1. **Detection**: System scans `/public/templates/` directory
2. **Parsing**: Extracts metadata from HTML comments
3. **Fallback**: Uses filename if metadata is missing
4. **Sorting**: Templates are sorted alphabetically
5. **Display**: Shows in Templates page with categories and descriptions

## 📝 Example Template

```html
<!-- @template-name: Simple Business -->
<!-- @template-description: Clean and simple business invoice template -->
<!-- @template-category: Standard -->
<!-- @template-author: Your Company -->
<!-- @template-version: 1.0 -->
<!DOCTYPE html>
<html>
<head>
  <title>{{COMPANY_NAME}} - Invoice #{{BILL_NUMBER}}</title>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    .profile-photo {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
    }
    /* Your CSS styles here */
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      {{PROFILE_PHOTO}}
      <h1>{{COMPANY_NAME}}</h1>
    </div>
    <p>Invoice #: {{BILL_NUMBER}}</p>
    <p>Date: {{BILL_DATE}}</p>
    
    <!-- Company and Customer details -->
    <!-- Items table -->
    <!-- Totals and summary -->
  </div>
</body>
</html>
```

## 🚀 Deployment

Once you add a new template file:
1. The system automatically detects it
2. It appears in the Templates page immediately
3. Users can preview and select it as their default
4. No server restart required!

This dynamic system makes it easy to expand template options without code changes.
