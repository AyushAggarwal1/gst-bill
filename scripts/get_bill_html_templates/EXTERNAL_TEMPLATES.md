-   # External Templates System

## 📋 Overview

The GST Bill application now supports **external templates** from GitHub repositories. This allows you to:

- Fetch templates from external repositories
- Use community-contributed templates
- Keep your template collection updated
- Maintain separation between local and external templates

## 🚀 Quick Start

### 1. Configure External Repository

Edit `scripts/get_bill_html_templates/template-config.json` with your GitHub repository details:

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

### 2. Fetch Templates

Run the template fetcher script:

```bash
# Fetch templates from external repository
node scripts/fetch-templates.js fetch

# List downloaded templates
node scripts/fetch-templates.js list

# Check system status
node scripts/fetch-templates.js status
```

### 3. Use External Templates

External templates will automatically appear in your template selection interface alongside local templates.

## 📁 Directory Structure

```
public/
├── templates/           # Local templates
│   ├── billFormat.html
│   ├── corporate.html
│   └── ...
└── external-templates/  # External templates
    ├── index.json       # Template index
    ├── template1.html
    ├── template2.html
    └── ...
```

## 🔧 Configuration Options

### Repository Settings

- `owner`: GitHub username or organization
- `repo`: Repository name
- `branch`: Branch to fetch from (default: `main`)
- `path`: Subdirectory containing templates (optional)

### Local Paths

- `externalTemplatesDir`: Where to store external templates
- `templateIndexFile`: Index file location

### Validation

- `requiredPlaceholders`: Required template variables
- `optionalPlaceholders`: Optional template variables

## 📝 Template Requirements

External templates must include these placeholder variables:

### Required Placeholders
- `{{COMPANY_NAME}}` - Company/Business name
- `{{COMPANY_ADDRESS}}` - Company address
- `{{COMPANY_GST}}` - Company GST number
- `{{CUSTOMER_NAME}}` - Customer name
- `{{CUSTOMER_ADDRESS}}` - Customer address
- `{{CUSTOMER_GST}}` - Customer GST number
- `{{BILL_NUMBER}}` - Invoice/Bill number
- `{{BILL_DATE}}` - Invoice date
- `{{TAX_TYPE}}` - Tax type (IGST or CGST/SGST)
- `{{ITEMS_TABLE}}` - Items table HTML
- `{{SUBTOTAL}}` - Subtotal amount
- `{{TAX_ROWS}}` - Tax rows HTML
- `{{TOTAL}}` - Total amount
- `{{AMOUNT_IN_WORDS}}` - Total amount in words

### Optional Placeholders
- `{{COMPANY_PHONE}}` - Company phone
- `{{DELIVERY_ADDRESS}}` - Delivery address
- `{{BANK_DETAILS}}` - Bank details section
- `{{PROFILE_PHOTO}}` - Business logo/photo

## 🛠️ Script Commands

### Fetch Templates
```bash
node scripts/fetch-templates.js fetch
```
Downloads all HTML templates from the configured repository.

### Create Index
```bash
node scripts/fetch-templates.js index
```
Creates/updates the template index file.

### List Templates
```bash
node scripts/fetch-templates.js list
```
Lists all downloaded external templates.

### Show Status
```bash
node scripts/fetch-templates.js status
```
Shows system configuration and status.

### Help
```bash
node scripts/fetch-templates.js help
```
Shows available commands and usage.

## 🔄 Template Updates

### Manual Updates
Run the fetch command to update templates:
```bash
node scripts/fetch-templates.js fetch
```

### Automatic Updates (Future)
Configure automatic updates in `template-config.json`:
```json
{
  "autoUpdate": {
    "enabled": true,
    "interval": "24h"
  }
}
```

## 📊 Template Metadata

External templates automatically get metadata added:

```html
<!-- @template-name: Template Name -->
<!-- @template-description: Template imported from external repository -->
<!-- @template-category: External -->
<!-- @template-author: External Repository -->
<!-- @template-version: 1.0 -->
<!-- @template-source: username/repo -->
<!-- @template-import-date: 2024-01-01T00:00:00.000Z -->
```

## 🎯 Template Validation

The system validates templates for:
- Required placeholder variables
- HTML structure
- File format (must be .html)

Invalid templates are still downloaded but marked with warnings.

## 🔍 API Endpoints

### Get External Templates
```
GET /api/templates/external
```
Returns list of all external templates.

### Get Specific Template
```
GET /api/templates/external?template=templateName.html
```
Returns specific template content and metadata.

## 🚨 Error Handling

### Common Issues

1. **Repository not found**
   - Check GitHub username and repository name
   - Ensure repository is public or you have access

2. **No HTML files found**
   - Check the `path` configuration
   - Ensure templates are .html files

3. **Template validation fails**
   - Check required placeholders
   - Review template structure

4. **Permission denied**
   - Ensure repository is public
   - Check GitHub API rate limits

### Troubleshooting

```bash
# Check configuration
node scripts/fetch-templates.js status

# Test repository access
curl https://api.github.com/repos/username/repo/contents

# View error logs
tail -f logs/template-fetch.log
```

## 🔒 Security Considerations

- Only fetch from trusted repositories
- Review template content before use
- External templates are stored locally after download
- No automatic code execution from templates

## 📈 Best Practices

1. **Repository Organization**
   - Use descriptive template names
   - Include README with template descriptions
   - Version your templates

2. **Template Development**
   - Follow the required placeholder structure
   - Include comprehensive metadata
   - Test templates before publishing

3. **Maintenance**
   - Regularly update external templates
   - Monitor for template updates
   - Keep local and external templates organized

## 🤝 Contributing Templates

To contribute templates to the community:

1. Create a GitHub repository
2. Add HTML templates with proper metadata
3. Ensure all required placeholders are included
4. Test templates thoroughly
5. Share repository details with the community

## 📞 Support

For issues with external templates:

1. Check the troubleshooting section
2. Review error logs
3. Verify repository configuration
4. Contact support with specific error messages
