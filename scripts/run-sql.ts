import { readFileSync } from 'fs';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.development') });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

async function main() {
  try {
    const script = readFileSync(resolve(process.cwd(), 'supabase/migrations/20240101000001_calculator_tables.sql'), 'utf-8');
    
    // First ensure roofcost schema exists
    await sql`CREATE SCHEMA IF NOT EXISTS roofcost`;
    
    // Set search path
    await sql`SET search_path TO roofcost`;

    console.log("Executing migration script...");
    await sql.unsafe(script);
    console.log("Migration executed successfully!");
    
    // Also enable RLS and add basic policies as per spec T-01
    console.log("Applying RLS policies...");
    await sql.unsafe(`
      ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE quote_submissions ENABLE ROW LEVEL SECURITY;
      
      -- Drop policies if they exist before creating
      DROP POLICY IF EXISTS "anon insert calculations" ON calculations;
      DROP POLICY IF EXISTS "anon insert quotes" ON quote_submissions;
      DROP POLICY IF EXISTS "service read all" ON calculations;
      DROP POLICY IF EXISTS "service read quotes" ON quote_submissions;

      CREATE POLICY "anon insert calculations" ON calculations FOR INSERT TO anon WITH CHECK (true);
      CREATE POLICY "anon insert quotes" ON quote_submissions FOR INSERT TO anon WITH CHECK (true);
      CREATE POLICY "service read all" ON calculations FOR SELECT TO service_role USING (true);
      CREATE POLICY "service read quotes" ON quote_submissions FOR SELECT TO service_role USING (true);
    `);
    console.log("RLS policies applied!");
  } catch (err) {
    console.error("Error executing migration:", err);
  } finally {
    await sql.end();
  }
}

main();
