import postgres from 'postgres';
import { envConfigs } from '@/config';

async function cleanAllTables() {
  const sql = postgres(envConfigs.database_url!, {
    max: 1,
  });

  try {
    console.log('🧹 Cleaning all tables in roofcost schema...\n');

    // Get all tables in roofcost schema
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'roofcost'
      ORDER BY table_name
    `;

    console.log(`Found ${tables.length} tables to delete:`);

    // Drop all tables with CASCADE to handle dependencies
    for (const table of tables) {
      const tableName = table.table_name;
      try {
        await sql.unsafe(`DROP TABLE IF EXISTS roofcost."${tableName}" CASCADE`);
        console.log(`  ✅ Dropped table: ${tableName}`);
      } catch (error) {
        console.error(`  ❌ Error dropping ${tableName}:`, error);
      }
    }

    console.log('\n✅ All tables dropped successfully!');
  } catch (error) {
    console.error('❌ Error cleaning tables:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

cleanAllTables();
