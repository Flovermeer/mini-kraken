import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Crée une base SQLite vide, en mémoire, avec le même schéma que la vraie base.
 *
 * On rejoue les vraies migrations (V1, V2, ...) dans l'ordre : si tu ajoutes
 * une migration, les tests l'utiliseront automatiquement.
 * La base disparaît à la fin du test : rien n'est écrit sur le disque.
 */
export function createTestDb(): DatabaseSync {
    const db = new DatabaseSync(':memory:');
    // SQLite n'applique les clés étrangères (REFERENCES, ON DELETE RESTRICT) que si on le lui demande,
    // et ce réglage vaut pour la connexion : à refaire à chaque ouverture, comme pour la vraie base.
    db.exec('PRAGMA foreign_keys = ON');
    const migrationsDir = path.join(import.meta.dirname, '../database/migrations');

    const files = fs.readdirSync(migrationsDir)
        .filter(file => /^V\d+__.+\.sql$/.test(file))
        // Tri par numéro de version (V2 avant V10), comme dans migrate.ts
        .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

    for (const file of files) {
        db.exec(fs.readFileSync(path.join(migrationsDir, file), 'utf-8'));
    }

    return db;
}
