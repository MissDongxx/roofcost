import postgres from 'postgres';
import { envConfigs } from '@/config';
import { readFileSync } from 'fs';
import { join } from 'path';

async function directMigrate() {
  const sql = postgres(envConfigs.database_url!, {
    max: 1,
  });

  try {
    console.log('🚀 Starting direct migration...\n');

    // Read the migration file
    const migrationPath = join(process.cwd(), 'src/config/db/migrations/0000_fresh_wolverine.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split by statement breakpoint
    const statements = migrationSQL.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      try {
        await sql.unsafe(statements[i]);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
      } catch (error: any) {
        // If table already exists, log but continue
        if (error.code === '42P07') {
          console.log(`⏭️  Statement ${i + 1}/${statements.length} skipped (table already exists)`);
        } else {
          console.error(`❌ Statement ${i + 1}/${statements.length} failed:`, error.message);
          throw error;
        }
      }
    }

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

directMigrate();
