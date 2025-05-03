const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function viewAllAuthLogs() {
  try {
    console.log('Fetching all authentication logs from the database...\n');
    
    const logs = await prisma.authLog.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    if (logs.length === 0) {
      console.log('No authentication logs found in the database.');
      return;
    }
    
    console.log(`Found ${logs.length} authentication logs:\n`);
    
    // Display logs in a tabular format
    console.log('Timestamp'.padEnd(30) + 'Event'.padEnd(15) + 'Email'.padEnd(35) + 'Details');
    console.log('-'.repeat(100));
    
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      const event = log.event.padEnd(15);
      const email = log.email.padEnd(35);
      const details = log.details || '';
      
      console.log(`${timestamp} ${event} ${email} ${details}`);
    });
    
    // Display summary
    const loginCount = logs.filter(log => log.event === 'LOGIN').length;
    const logoutCount = logs.filter(log => log.event === 'LOGOUT').length;
    const failedCount = logs.filter(log => log.event === 'LOGIN_FAILED').length;
    
    console.log('\nSummary:');
    console.log(`- Total logs: ${logs.length}`);
    console.log(`- Successful logins: ${loginCount}`);
    console.log(`- Logouts: ${logoutCount}`);
    console.log(`- Failed login attempts: ${failedCount}`);
    
  } catch (error) {
    console.error('Error fetching authentication logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
viewAllAuthLogs(); 