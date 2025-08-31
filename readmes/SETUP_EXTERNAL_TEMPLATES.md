# External Templates Setup Guide

## 🎯 What You've Got

I've set up a complete external template system for your GST Bill application that allows you to fetch and use HTML templates from any GitHub repository. Here's what's been implemented:

### ✅ What's Ready

1. **Template Fetcher Script** (`scripts/get_bill_html_templates/fetch-templates.js`)
   - Downloads templates from GitHub repositories
   - Validates template structure
   - Adds metadata automatically
   - Creates template index

2. **Configuration System** (`scripts/get_bill_html_teamplates/template-config.json`)
   - Easy repository configuration
   - Template validation rules
   - Update settings

3. **API Integration**
   - External templates work alongside local templates
   - Same template selection interface
   - Automatic template loading

4. **Documentation**
   - Complete setup guide
   - Template requirements
   - Troubleshooting guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Configure Your Repository

Edit `scripts/get_bill_html_templates/template-config.json`:

```json
{
  "externalRepo": {
    "owner": "your-github-username",
    "repo": "your-templates-repo", 
    "branch": "main",
    "path": "templates"
  }
}
```

**Replace:**
- `your-github-username` with your actual GitHub username
- `your-templates-repo` with your repository name
- `path` with the subdirectory containing templates (optional)

### Step 2: Fetch Templates

```bash
# Using npm script (recommended)
npm run templates:fetch

# Or directly
node scripts/get_bill_html_templates/fetch-templates.js fetch
```

### Step 3: Use Templates

External templates will automatically appear in your template selection interface alongside your existing templates.

## 📁 Repository Structure

Your GitHub repository should have this structure:

```
your-templates-repo/
├── templates/              # Your templates directory
│   ├── modern-invoice.html
│   ├── classic-invoice.html
│   └── minimal-invoice.html
└── README.md              # Optional documentation
```

## 📝 Template Requirements

Each HTML template must include these placeholder variables:

### Required Variables
```html
{{COMPANY_NAME}}      <!-- Company name -->
{{COMPANY_ADDRESS}}   <!-- Company address -->
{{COMPANY_GST}}       <!-- Company GST number -->
{{CUSTOMER_NAME}}     <!-- Customer name -->
{{CUSTOMER_ADDRESS}}  <!-- Customer address -->
{{CUSTOMER_GST}}      <!-- Customer GST number -->
{{BILL_NUMBER}}       <!-- Invoice number -->
{{BILL_DATE}}         <!-- Invoice date -->
{{TAX_TYPE}}          <!-- Tax type (IGST/CGST/SGST) -->
{{ITEMS_TABLE}}       <!-- Items table HTML -->
{{SUBTOTAL}}          <!-- Subtotal amount -->
{{TAX_ROWS}}          <!-- Tax rows HTML -->
{{TOTAL}}             <!-- Total amount -->
{{AMOUNT_IN_WORDS}}   <!-- Amount in words -->
```

### Optional Variables
```html
{{COMPANY_PHONE}}     <!-- Company phone -->
{{DELIVERY_ADDRESS}}  <!-- Delivery address -->
{{BANK_DETAILS}}      <!-- Bank details -->
{{PROFILE_PHOTO}}     <!-- Business logo -->
```

## 🛠️ Available Commands

```bash
# Fetch templates from repository
npm run templates:fetch

# List downloaded templates
npm run templates:list

# Check system status
npm run templates:status

# Create/update template index
npm run templates:index
```

## 📊 Example Template

## 🔍 Testing the System

1. **Check Status:**
   ```bash
   npm run templates:status
   ```

2. **Test with Example Repository:**
   - Create a public GitHub repository
   - Add some HTML templates
   - Update the config with your repository details
   - Run `npm run templates:fetch`

3. **Verify in Application:**
   - Go to your templates page
   - External templates should appear alongside local ones
   - You can select and use them just like local templates

## 🚨 Common Issues & Solutions

### "Repository not found"
- Check GitHub username and repository name
- Ensure repository is public
- Verify repository exists

### "No HTML files found"
- Check the `path` configuration
- Ensure templates are `.html` files
- Verify files are in the correct directory

### "Template validation fails"
- Check required placeholders are present
- Review template structure
- Use the example template as reference

## 📈 Next Steps

1. **Set up your repository** with some templates
2. **Configure the system** with your repository details
3. **Fetch templates** using the provided commands
4. **Test the integration** in your application
5. **Share templates** with the community!

## 🔗 Useful Files

- `scripts/fetch-templates.js` - Main template fetcher
- `scripts/template-config.json` - Configuration
- `readmes/EXTERNAL_TEMPLATES.md` - Detailed documentation
- `src/app/api/templates/external/route.ts` - API endpoint

## 💡 Tips

1. **Start Simple:** Use the example template as a base
2. **Test Locally:** Create a test repository first
3. **Version Control:** Keep your templates in version control
4. **Documentation:** Add README files to your template repositories
5. **Community:** Share your templates with others!

## 🆘 Need Help?

If you encounter any issues:

1. Check the troubleshooting section in `readmes/EXTERNAL_TEMPLATES.md`
2. Verify your repository configuration
3. Test with the example template
4. Check the console for error messages

The system is designed to be robust and provide clear error messages to help you resolve any issues quickly.
