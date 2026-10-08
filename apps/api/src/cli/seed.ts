import { createDatabase, dbEnvSchema } from '@aivo/db';
import { parseEnv } from '@aivo/shared';
import { seedDatabase } from '../seed.js';

const { DATABASE_URL } = parseEnv(dbEnvSchema);
const connection = createDatabase(DATABASE_URL);
try {
  const summary = await seedDatabase(connection.db);
  console.info('[seed] done', summary);
} finally {
  await connection.close();
}
