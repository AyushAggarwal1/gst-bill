#!/usr/bin/env node

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function updateTemplatePaths() {
  try {
    console.log('🔍 Checking for old template paths in database...');
    
    // Find profiles with old external-templates paths
    const profilesWithOldPaths = await prisma.profile.findMany({
      where: {
        defaultTemplate: {
          startsWith: 'external-templates/'
        }
      }
    });
    
    console.log(`Found ${profilesWithOldPaths.length} profiles with old template paths`);
    
    if (profilesWithOldPaths.length === 0) {
      console.log('✅ No old template paths found. Database is up to date.');
      return;
    }
    
    // Update each profile
    for (const profile of profilesWithOldPaths) {
      const oldPath = profile.defaultTemplate;
      const newPath = oldPath.replace('external-templates/', '');
      
      console.log(`Updating profile ${profile.id}:`);
      console.log(`  Old path: ${oldPath}`);
      console.log(`  New path: ${newPath}`);
      
      await prisma.profile.update({
        where: { id: profile.id },
        data: { defaultTemplate: newPath }
      });
    }
    
    console.log('✅ Successfully updated all template paths in database');
    
  } catch (error) {
    console.error('❌ Error updating template paths:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateTemplatePaths();
