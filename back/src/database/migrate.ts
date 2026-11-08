import path from 'node:path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { dir } from './database.js';

const VERSION_REGEX = /^V(\d+)__([a-zA-Z0-9_]+)\.sql$/;
const files = fs.readdirSync(path.join(import.meta.dirname, 'migrations'));

const migrations = files
    .filter(file => VERSION_REGEX.test(file))
    .sort((a, b) => {
        const versionA = parseInt(a.match(VERSION_REGEX)?.[1] ?? '0', 10);
        const versionB = parseInt(b.match(VERSION_REGEX)?.[1] ?? '0', 10);
        return versionA - versionB;
});
    
const db = new DatabaseSync(path.join(dir, 'database.db'));

const executedMigrations = db.prepare(
    'SELECT version FROM schema_migrations'
).all();

const executedVersions = new Set(
    executedMigrations.map(row => Number(row.version))
);

const migrationsToExecute = migrations.filter(file => {
    const version = Number(file.match(VERSION_REGEX)![1]);

    return !executedVersions.has(version);
});



db.exec('BEGIN TRANSACTION');

try {
    migrationsToExecute.forEach(file => {
        const version = Number(file.match(VERSION_REGEX)![1]);
        const description = file.match(VERSION_REGEX)![2];
        const sql = fs.readFileSync(path.join(import.meta.dirname, 'migrations', file), 'utf-8');
        

        db.exec(sql)
        db.prepare(`
            INSERT INTO schema_migrations (version, description, executed_at)
            VALUES (?, ?, datetime('now'))`)
        .run(version!, description!);
    
    });

    db.exec('COMMIT');
} catch (error) {
    db.exec('ROLLBACK');
    throw error;
}