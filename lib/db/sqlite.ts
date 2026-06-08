import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as secretsSchema from './schema/sqlite-secrets';

const sqlitePath = process.env.SECRETS_DB_PATH || './secrets.db';

const sqlite = new Database(sqlitePath);
sqlite.pragma('journal_mode = WAL');

export const sqliteDb = drizzle(sqlite, { schema: secretsSchema });
