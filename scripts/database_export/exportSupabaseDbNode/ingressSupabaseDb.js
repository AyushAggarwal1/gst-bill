import { PrismaClient, Prisma } from '../src/generated/prisma/index.js';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Helper function to convert PascalCase model names to camelCase for Prisma Client
function toCamelCase(str) {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// Define the order of import and the corresponding file names
// Note: 'User' is listed twice in the original request, assuming one is 'User' and the other is 'UserRole'.
// The file for 'User' is 'users_export.json' as per the file list.
const modelsAndFiles = [
  // { modelNamePascal: 'User', fileName: 'users_export.json' },
  // { modelNamePascal: 'Profile', fileName: 'profile_export.json' },
  // { modelNamePascal: 'Customer', fileName: 'customer_export.json' },
  // { modelNamePascal: 'Item', fileName: 'item_export.json' },
  // { modelNamePascal: 'UserRole', fileName: 'userrole_export.json' },
  // { modelNamePascal: 'Invitation', fileName: 'invitation_export.json' },
  // { modelNamePascal: 'Bill', fileName: 'bill_export.json' },
  // { modelNamePascal: 'BillItem', fileName: 'billitem_export.json' },
];

// Script is inside exportedPrismaDBdata, so JSON files are in the current working directory.
const dataFolderPath = process.cwd() + '/data';

async function importAllData() {
  console.log('Starting data import...');
  console.log(`Looking for JSON files in: ${dataFolderPath}`);

  try {
    for (const { modelNamePascal, fileName } of modelsAndFiles) {
      const modelNameCamelCase = toCamelCase(modelNamePascal);
      const filePath = path.join(dataFolderPath, fileName);

      console.log(`Processing ${fileName} for model ${modelNamePascal}...`);
      console.log(`Attempting to read from: ${filePath}`);

      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const records = JSON.parse(fileContent);

        if (!Array.isArray(records)) {
          console.warn(`Skipping ${fileName}: Content is not an array.`);
          continue;
        }
        if (records.length === 0) {
          console.log(`Skipping ${fileName}: No records to import.`);
          continue;
        }
        
        // Ensure dates are correctly formatted for Prisma (ISO 8601 strings)
        const recordsToCreate = records.map(record => {
          const newRecord = { ...record };
          for (const key in newRecord) {
            // Check if the field is a date field based on common naming or if it's a string that looks like a date
            // Prisma expects date strings to be in ISO 8601 format.
            // This is a basic check; more robust date field identification might be needed for complex schemas.
            if (newRecord[key] && (key.endsWith('At') || key.endsWith('Date') || key === 'expiresAt')) {
              if (typeof newRecord[key] === 'string' || typeof newRecord[key] === 'number') {
                const date = new Date(newRecord[key]);
                if (!isNaN(date.getTime())) {
                  newRecord[key] = date.toISOString();
                } else {
                   // If parsing fails, keep original or set to null, depending on requirements
                  console.warn(`Could not parse date for ${key}: ${newRecord[key]} in ${fileName}`);
                }
              }
            }
          }
          return newRecord;
        });


        if (prisma[modelNameCamelCase] && typeof prisma[modelNameCamelCase].create === 'function') {
          let createdCount = 0;
          let skippedCount = 0;

          for (const record of recordsToCreate) {
            try {
              await prisma[modelNameCamelCase].create({ data: record });
              createdCount++;
            } catch (error) {
              if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                // P2002 is the error code for unique constraint failed,
                // which usually means the record (by ID or other unique field) already exists.
                console.log(`Skipped record in ${modelNamePascal} (ID: ${record.id || 'N/A'}): Already exists.`);
                skippedCount++;
              } else {
                console.error(`Error creating record in ${modelNamePascal} (ID: ${record.id || 'N/A'}) - Data: ${JSON.stringify(record)}:`, error.message, error.stack);
                // Optionally, rethrow if it's not a P2002 error or handle differently
              }
            }
          }
          console.log(`Finished importing for ${modelNamePascal}: ${createdCount} created, ${skippedCount} skipped.`);
        } else {
          console.warn(`Skipping ${modelNamePascal}: Model (as ${modelNameCamelCase}) not found on Prisma client or does not support create.`);
        }
      } catch (readError) {
        if (readError.code === 'ENOENT') {
          console.warn(`Skipping ${modelNamePascal}: File ${fileName} not found at ${filePath}`);
        } else {
          console.error(`Error reading or parsing ${fileName} for ${modelNamePascal}:`, readError.message);
        }
      }
    }
    console.log('All specified data has been processed.');
  } catch (error) {
    console.error('An error occurred during the data import process:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

importAllData(); 