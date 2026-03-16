import { defineConfig } from 'drizzle-kit';

import { envConfigs } from '@/config';

// get db credentials
const dbCredentials: { url: string; authToken?: string } = {
  url: envConfigs.database_url ?? '',
};
if (envConfigs.database_auth_token) {
  dbCredentials.authToken = envConfigs.database_auth_token;
}

// define config
export default defineConfig({
  out: envConfigs.db_migrations_out,
  schema: envConfigs.db_schema_file,
  dialect: envConfigs.database_provider as
    | 'sqlite'
    | 'postgresql'
    | 'mysql'
    | 'turso'
    | 'singlestore'
    | 'gel',
  dbCredentials,
  // Isolation: manage both public and our business schema to prevent Drizzle from 
  // getting confused about schema existence, but use tablesFilter to only 
  // TOUCH the tables in our business schema.
  schemaFilter: ['public', envConfigs.db_schema || 'roofcost'],
  // Protection: only manage tables that are in our business schema.
  // This tells Drizzle: "Ignore everything in public, only look at roofcost.*"
  tablesFilter: [`${envConfigs.db_schema || 'roofcost'}.*`],
  // Migration journal location (used by drizzle-kit migrate)
  migrations:
    envConfigs.database_provider === 'postgresql'
      ? {
          schema: envConfigs.db_migrations_schema,
          table: envConfigs.db_migrations_table,
        }
      : undefined,
});
