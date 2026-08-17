#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

const CONFIG_PATH = path.join(__dirname, 'template-config.json');

let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (error) {
  log('Failed to load configuration file scripts/get_bill_html_templates/template-config.json', 'error');
  process.exit(1);
}

const enabled = Boolean(config?.autoUpdate?.enabled);

if (!enabled) {
  log('Auto update disabled. Skipping template fetch.');
  process.exit(0);
}

try {
  log('Auto update enabled. Fetching external templates...');
  execSync('node scripts/get_bill_html_templates/fetch-templates.js fetch', { stdio: 'inherit' });
  log('Template fetch complete.', 'success');
  process.exit(0);
} catch (error) {
  log(`Template fetch failed: ${error.message}`, 'error');
  process.exit(1);
}


