import postgres from 'postgres';
import { envConfigs } from '@/config';

async function cleanSchema() {
  const sql = postgres(envConfigs.database_url!, {
    max: 1,
  });

  try {
    console.log('🧹 Cleaning roofcost schema...\n');

    // Drop the entire schema and recreate it
    await sql`DROP SCHEMA IF EXISTS roofcost CASCADE`;
    console.log('✅ Dropped roofcost schema');

    await sql`CREATE SCHEMA roofcost`;
    console.log('✅ Created fresh roofcost schema');

    console.log('\n🎉 Schema cleanup complete! You can now run: npm run db:push');
  } catch (error) {
    console.error('❌ Error cleaning schema:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

cleanSchema();
