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
    console.log("Testing database connection...");
    
    // Set search path
    await sql`SET search_path TO roofcost`;

    const countTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'roofcost'
    `;
    console.log(`Found ${countTables.length} tables in roofcost schema:`, countTables.map(t => t.table_name).join(', '));
    
    // Optional: Try query material_prices if it exists in the list
    if (countTables.some(t => t.table_name === 'material_prices')) {
      const result = await sql`SELECT count(*) FROM material_prices`;
      console.log(`material_prices table has ${result[0].count} rows.`);
    } else {
      console.log('material_prices table does not exist in the schema yet.');
    }
    
  } catch (err) {
    console.error("Error executing connection test:", err);
  } finally {
    await sql.end();
  }
}

main();
