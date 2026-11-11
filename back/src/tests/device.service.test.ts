import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { DeviceService } from '../services/device.service.js';
import type { DiscoveredDevice } from '../api/generated/models/DiscoveredDevice.js';

/**
 * Crée une base SQLite vide, en mémoire, avec le même schéma que la vraie base.
 *
 * On rejoue les vraies migrations (V1, V2, ...) dans l'ordre : si tu ajoutes
 * une migration, les tests l'utiliseront automatiquement.
 * La base disparaît à la fin du test : rien n'est écrit sur le disque.
 */
function createTestDb(): DatabaseSync {
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

describe('DeviceService', () => {
    let service: DeviceService;

    // Avant CHAQUE test : une base neuve et un service neuf.
    // Les tests ne se polluent donc pas entre eux.
    beforeEach(() => {
        service = new DeviceService(createTestDb());
    });

    describe('pairDevice', () => {
        it('renvoie le cadre appairé avec un UUID, le nom choisi et l\'id matériel', () => {
            const device = service.pairDevice({ id: 'frame-0001', name: 'Cuisine' });

            expect(device.name).toBe('Cuisine');
            expect(device.mDNS).toBe('frame-0001');
            // L'id est un UUID généré par le serveur, pas l'id du cadre
            expect(device.id).toMatch(/^[0-9a-f-]{36}$/);
            expect(device.id).not.toBe('frame-0001');
            // created_at est une date ISO 8601 valide
            expect(new Date(device.created_at).toISOString()).toBe(device.created_at);
        });

        it('enregistre le cadre en base', () => {
            const device = service.pairDevice({ id: 'frame-0001', name: 'Cuisine' });

            expect(service.pairedDevices()).toEqual([device]);
        });

        it('renvoie une erreur si le cadre est déjà enregistré en base', () => {
           service.pairDevice({ id: 'frame-0001', name: 'Cuisine' });
           expect(() => service.pairDevice({ id: 'frame-0001', name: 'Cuisine' })).toThrow('UNIQUE');
        });
    });

    describe('pairedDevices', () => {
        it('renvoie une liste vide quand aucun cadre n\'est appairé', () => {
            expect(service.pairedDevices()).toEqual([]);
        });
    });

    describe('filterAlreadyPairedDevices', () => {
        // Une liste de découvertes fabriquée à la main : pas besoin du réseau.
        const discovered: DiscoveredDevice[] = [
            { id: 'frame-0001', name: 'Cadre test 1' },
            { id: 'frame-0002', name: 'Cadre test 2' },
        ];

        it('retire les cadres déjà appairés et garde les autres', () => {
            service.pairDevice({ id: 'frame-0001', name: 'Cuisine' });

            expect(service.filterAlreadyPairedDevices(discovered)).toEqual([
                { id: 'frame-0002', name: 'Cadre test 2' },
            ]);
        });
    });
});
