import postgres from 'postgres';
import { envConfigs } from '@/config';

async function checkDatabase() {
  const sql = postgres(envConfigs.database_url!, {
    max: 1,
  });

  try {
    console.log('🔍 Checking database state...\n');

    // Check if roofcost schema exists
    const schemas = await sql`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = 'roofcost'
    `;

    if (schemas.length === 0) {
      console.log('✅ Schema "roofcost" does not exist yet - clean state!');
    } else {
      console.log('⚠️  Schema "roofcost" exists!');

      // Get all tables in roofcost schema
      const tables = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'roofcost'
        ORDER BY table_name
      `;

      console.log(`\n📊 Found ${tables.length} tables:`);
      tables.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.table_name}`);
      });
    }

    console.log('\n✅ Database check complete!');
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await sql.end();
  }
}

checkDatabase();
