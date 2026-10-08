import { parseEnv } from '@aivo/shared';
import { createDatabase } from '../client.js';
import { dbEnvSchema } from '../config.js';
import { migrate } from '../migrate.js';

const { DATABASE_URL } = parseEnv(dbEnvSchema);
const connection = createDatabase(DATABASE_URL);
try {
  await migrate(connection);
  console.info('[db] migrations applied');
} finally {
  await connection.close();
}
