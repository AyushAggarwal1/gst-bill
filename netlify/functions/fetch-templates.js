const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.handler = async function () {
  try {
    const configPath = path.join(__dirname, '../../scripts/get_bill_html_templates/template-config.json');
    const raw = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(raw);
    if (!config?.autoUpdate?.enabled) {
      return {
        statusCode: 200,
        body: JSON.stringify({ skipped: true, reason: 'autoUpdate.disabled' })
      };
    }
  } catch (e) {
    // If config is missing or unreadable, proceed to attempt fetch to surface errors
  }

  return new Promise((resolve) => {
    exec('node scripts/get_bill_html_templates/fetch-templates.js fetch', (error, stdout, stderr) => {
      if (error) {
        console.error(stderr || error.message);
        resolve({ statusCode: 500, body: stderr || error.message });
        return;
      }
      resolve({ statusCode: 200, body: stdout || 'ok' });
    });
  });
};


