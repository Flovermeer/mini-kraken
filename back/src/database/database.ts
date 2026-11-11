import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'fs';

export const dir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
const db = new DatabaseSync(path.join(dir, 'database.db'));
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    executed_at TEXT NOT NULL)
`);

export function getDb(): DatabaseSync {
    return db;
}