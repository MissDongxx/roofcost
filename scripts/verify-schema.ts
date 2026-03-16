import postgres from 'postgres';
import { envConfigs } from '@/config';

async function verifySchema() {
  const sql = postgres(envConfigs.database_url!, {
    max: 1,
  });

  try {
    console.log('🔍 Verifying database schema...\n');

    // Get all tables in roofcost schema
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'roofcost'
      ORDER BY table_name
    `;

    console.log(`✅ Found ${tables.length} tables in roofcost schema:\n`);

    // Check a few key tables for their structure
    const keyTables = ['user', 'account', 'session', 'order', 'subscription', 'inspection'];

    for (const tableName of keyTables) {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'roofcost' AND table_name = ${tableName}
        ORDER BY ordinal_position
      `;

      if (columns.length > 0) {
        console.log(`📋 Table: ${tableName}`);
        console.log(`   Columns: ${columns.length}`);
        columns.slice(0, 3).forEach((col) => {
          console.log(`   - ${col.column_name}: ${col.data_type}${col.is_nullable === 'YES' ? ' (nullable)' : ''}`);
        });
        if (columns.length > 3) {
          console.log(`   ... and ${columns.length - 3} more`);
        }
        console.log('');
      }
    }

    console.log('✅ Schema verification complete!');
    console.log('\n💡 Your database tables appear to be already created.');
    console.log('   You can now use your application with these tables.');
  } catch (error) {
    console.error('❌ Error verifying schema:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

verifySchema();
