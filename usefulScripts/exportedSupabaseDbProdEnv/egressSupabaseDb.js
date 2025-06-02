import { PrismaClient } from '../src/generated/prisma/index.js';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Helper function to convert PascalCase model names to camelCase for Prisma Client
function toCamelCase(str) {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1);
}

async function exportAllData() {
  const modelsToExport = [
    'User',
    'Bill',
    'BillItem',
    'Customer',
    'Invitation',
    'Item',
    'Profile',
    'UserRole'
  ];

  console.log('Starting data export...');

  try {
    for (const modelNamePascalCase of modelsToExport) {
      const modelNameCamelCase = toCamelCase(modelNamePascalCase);

      // Check if the model exists on the prisma client and has findMany method
      if (prisma[modelNameCamelCase] && typeof prisma[modelNameCamelCase].findMany === 'function') {
        console.log(`Fetching data for ${modelNamePascalCase}...`);
        const data = await prisma[modelNameCamelCase].findMany();
        const filePath = path.join(process.cwd(), `${modelNamePascalCase.toLowerCase()}_export.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`Successfully exported ${modelNamePascalCase} data to ${filePath}`);
      } else {
        console.warn(`Skipping ${modelNamePascalCase}: Model (as ${modelNameCamelCase}) not found on Prisma client or does not support findMany.`);
      }
    }
    console.log('All specified data has been exported.');
  } catch (error) {
    console.error('An error occurred during data export:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

exportAllData();