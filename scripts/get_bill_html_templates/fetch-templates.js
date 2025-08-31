#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Load configuration
const CONFIG_PATH = path.join(__dirname, 'template-config.json');
let CONFIG;

try {
  CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (error) {
  console.error('❌ Failed to load configuration file. Please check scripts/template-config.json');
  process.exit(1);
}

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Created directory: ${dirPath}`);
  }
}

function makeHttpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: data });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// GitHub API functions
async function getRepositoryContents(owner, repo, path = '', branch = 'main') {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  
  try {
    const response = await makeHttpRequest(url, {
      headers: {
        'User-Agent': 'GST-Bill-Template-Fetcher',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch repository contents: ${error.message}`);
  }
}

async function downloadFile(downloadUrl, localPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(localPath);
    
    https.get(downloadUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (error) => {
      fs.unlink(localPath, () => {}); // Delete file on error
      reject(error);
    });
  });
}

// Template processing functions
function validateTemplate(templateContent, filename) {
  const missingPlaceholders = CONFIG.templateValidation.requiredPlaceholders.filter(placeholder => 
    !templateContent.includes(placeholder)
  );
  
  if (missingPlaceholders.length > 0) {
    log(`Template ${filename} is missing required placeholders: ${missingPlaceholders.join(', ')}`, 'warning');
    return false;
  }
  
  return true;
}

function addTemplateMetadata(templateContent, filename, sourceRepo) {
  const externalMetadata = `<!-- @template-source: ${sourceRepo.owner}/${sourceRepo.repo} -->
<!-- @template-import-date: ${new Date().toISOString()} -->
<!-- @template-category: External -->
<!-- @template-author: External Repository -->

`;
  
  // Check if external metadata already exists
  if (templateContent.includes('@template-source:')) {
    return templateContent; // Already has external metadata
  }
  
  // Add external metadata after existing metadata or at the beginning
  if (templateContent.includes('@template-name:')) {
    // Find the end of existing metadata and insert external metadata
    const lines = templateContent.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('@template-version:')) {
        insertIndex = i + 1;
        break;
      }
    }
    
    lines.splice(insertIndex, 0, externalMetadata);
    return lines.join('\n');
  } else {
    // No existing metadata, add complete metadata
    const completeMetadata = `<!-- @template-name: ${filename.replace('.html', '')} -->
<!-- @template-description: Template imported from external repository -->
<!-- @template-category: External -->
<!-- @template-author: External Repository -->
<!-- @template-version: 1.0 -->
<!-- @template-source: ${sourceRepo.owner}/${sourceRepo.repo} -->
<!-- @template-import-date: ${new Date().toISOString()} -->

`;
    return completeMetadata + templateContent;
  }
}

// Main functions
async function fetchTemplatesFromRepo() {
  log('Starting template fetch from external repository...');
  
  try {
    // Validate configuration
    if (CONFIG.externalRepo.owner === 'YOUR_GITHUB_USERNAME') {
      throw new Error('Please update the configuration in scripts/template-config.json with your GitHub repository details');
    }
    
    // Ensure directories exist
    const externalTemplatesDir = path.join(process.cwd(), CONFIG.localPaths.externalTemplatesDir);
    ensureDirectoryExists(externalTemplatesDir);
    
    // Get repository contents
    log(`Fetching contents from ${CONFIG.externalRepo.owner}/${CONFIG.externalRepo.repo}...`);
    const contents = await getRepositoryContents(
      CONFIG.externalRepo.owner,
      CONFIG.externalRepo.repo,
      CONFIG.externalRepo.path,
      CONFIG.externalRepo.branch
    );
    
    if (!Array.isArray(contents)) {
      throw new Error('Repository contents is not an array');
    }
    
    // Filter for HTML files
    const htmlFiles = contents.filter(item => 
      item.type === 'file' && item.name.toLowerCase().endsWith('.html')
    );
    
    if (htmlFiles.length === 0) {
      log('No HTML template files found in the repository', 'error');
      return;
    }
    
    log(`Found ${htmlFiles.length} HTML template files`);
    
    // Download each template
    let successCount = 0;
    let warningCount = 0;
    
    for (const file of htmlFiles) {
      try {
        const localPath = path.join(externalTemplatesDir, file.name);
        
        log(`Downloading ${file.name}...`);
        await downloadFile(file.download_url, localPath);
        
        // Read and validate template
        const templateContent = fs.readFileSync(localPath, 'utf8');
        
        if (validateTemplate(templateContent, file.name)) {
          // Add metadata if needed
          const processedContent = addTemplateMetadata(templateContent, file.name, CONFIG.externalRepo);
          fs.writeFileSync(localPath, processedContent);
          
          successCount++;
          log(`✅ Successfully processed ${file.name}`);
        } else {
          // Add metadata even for invalid templates
          const processedContent = addTemplateMetadata(templateContent, file.name, CONFIG.externalRepo);
          fs.writeFileSync(localPath, processedContent);
          
          warningCount++;
          log(`⚠️  Template ${file.name} has validation issues but was downloaded`);
        }
      } catch (error) {
        log(`Failed to process ${file.name}: ${error.message}`, 'error');
      }
    }
    
    log(`Successfully fetched ${successCount} templates (${warningCount} with warnings)`, 'success');
    
    // Update last update timestamp
    CONFIG.autoUpdate.lastUpdate = new Date().toISOString();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(CONFIG, null, 2));
    
  } catch (error) {
    log(`Failed to fetch templates: ${error.message}`, 'error');
    process.exit(1);
  }
}

function createTemplateIndex() {
  const externalTemplatesDir = path.join(process.cwd(), CONFIG.localPaths.externalTemplatesDir);
  const indexPath = path.join(process.cwd(), CONFIG.localPaths.templateIndexFile);
  const templates = [];
  
  if (fs.existsSync(externalTemplatesDir)) {
    const files = fs.readdirSync(externalTemplatesDir);
    
    for (const file of files) {
      if (file.toLowerCase().endsWith('.html')) {
        const filePath = path.join(externalTemplatesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract metadata
        const nameMatch = content.match(/@template-name:\s*(.+)/);
        const descMatch = content.match(/@template-description:\s*(.+)/);
        const categoryMatch = content.match(/@template-category:\s*(.+)/);
        const authorMatch = content.match(/@template-author:\s*(.+)/);
        const versionMatch = content.match(/@template-version:\s*(.+)/);
        const sourceMatch = content.match(/@template-source:\s*(.+)/);
        const importDateMatch = content.match(/@template-import-date:\s*(.+)/);
        
        templates.push({
          filename: file,
          name: nameMatch ? nameMatch[1].trim() : file.replace('.html', ''),
          description: descMatch ? descMatch[1].trim() : '',
          category: categoryMatch ? categoryMatch[1].trim() : 'External',
          author: authorMatch ? authorMatch[1].trim() : 'External',
          version: versionMatch ? versionMatch[1].trim() : '1.0',
          source: sourceMatch ? sourceMatch[1].trim() : '',
          importDate: importDateMatch ? importDateMatch[1].trim() : '',
          path: `${CONFIG.localPaths.externalTemplatesDir}/${file}`,
          url: `/templates/${file}`
        });
      }
    }
  }
  
  ensureDirectoryExists(path.dirname(indexPath));
  fs.writeFileSync(indexPath, JSON.stringify(templates, null, 2));
  log(`Created template index with ${templates.length} templates`);
}

function listTemplates() {
  const externalTemplatesDir = path.join(process.cwd(), CONFIG.localPaths.externalTemplatesDir);
  
  if (!fs.existsSync(externalTemplatesDir)) {
    log('No external templates directory found. Run "fetch" first.', 'warning');
    return;
  }
  
  const files = fs.readdirSync(externalTemplatesDir).filter(file => file.endsWith('.html'));
  
  if (files.length === 0) {
    log('No HTML templates found in external templates directory.', 'warning');
    return;
  }
  
  log(`Found ${files.length} external templates:`);
  files.forEach((file, index) => {
    const filePath = path.join(externalTemplatesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const nameMatch = content.match(/@template-name:\s*(.+)/);
    const name = nameMatch ? nameMatch[1].trim() : file.replace('.html', '');
    
    console.log(`  ${index + 1}. ${name} (${file})`);
  });
}

function showStatus() {
  log('Template System Status:');
  console.log(`  External Repository: ${CONFIG.externalRepo.owner}/${CONFIG.externalRepo.repo}`);
  console.log(`  Branch: ${CONFIG.externalRepo.branch}`);
  console.log(`  Path: ${CONFIG.externalRepo.path || 'root'}`);
  console.log(`  External Templates Dir: ${CONFIG.localPaths.externalTemplatesDir}`);
  
  const externalTemplatesDir = path.join(process.cwd(), CONFIG.localPaths.externalTemplatesDir);
  if (fs.existsSync(externalTemplatesDir)) {
    const files = fs.readdirSync(externalTemplatesDir).filter(file => file.endsWith('.html'));
    console.log(`  Templates Downloaded: ${files.length}`);
  } else {
    console.log(`  Templates Downloaded: 0 (directory doesn't exist)`);
  }
  
  if (CONFIG.autoUpdate.lastUpdate) {
    console.log(`  Last Update: ${CONFIG.autoUpdate.lastUpdate}`);
  }
}

// CLI interface
function showHelp() {
  console.log(`
GST Bill External Template Fetcher

Usage:
  node fetch-templates.js [command]

Commands:
  fetch     Fetch templates from external repository
  index     Create/update template index
  list      List downloaded templates
  status    Show system status
  help      Show this help message

Configuration:
  Edit scripts/template-config.json to set:
  - externalRepo.owner: GitHub username
  - externalRepo.repo: Repository name
  - externalRepo.branch: Branch to fetch from
  - externalRepo.path: Subdirectory containing templates (optional)

Example:
  node fetch-templates.js fetch
`);
}

// Main execution
async function main() {
  const command = process.argv[2] || 'help';
  
  switch (command) {
    case 'fetch':
      await fetchTemplatesFromRepo();
      createTemplateIndex();
      break;
    case 'index':
      createTemplateIndex();
      break;
    case 'list':
      listTemplates();
      break;
    case 'status':
      showStatus();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    log(`Script failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  fetchTemplatesFromRepo,
  createTemplateIndex,
  listTemplates,
  showStatus,
  CONFIG
};
