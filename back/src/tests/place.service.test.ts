import { describe, it, expect, beforeEach } from 'vitest';
import type { DatabaseSync } from 'node:sqlite';
import { PlaceService } from '../services/place.service.js';
import { ModelNotFoundException } from '../exceptions/ModelNotFoundException.js';
import { createTestDb } from './test-db.js';

describe('PlaceService', () => {
    let db: DatabaseSync;
    let service: PlaceService;

    beforeEach(() => {
        db = createTestDb();
        service = new PlaceService(db);
    });

    // Insère un cadre directement en SQL : pairDevice ne sait pas encore rattacher un cadre à un lieu.
    function insertDevice(id: string, name: string, placeId: string): void {
        db.prepare('INSERT INTO devices (id, name, created_at, mDNS, place_id) VALUES (?, ?, ?, ?, ?)')
            .run(id, name, '2026-01-01T00:00:00.000Z', `frame-${id}`, placeId);
    }

    describe('createPlace', () => {
        it('renvoie le lieu créé avec un UUID, le nom choisi et aucun cadre', () => {
            const place = service.createPlace({ name: 'Maison' });

            expect(place.id).toMatch(/^[0-9a-f-]{36}$/);
            expect(place.name).toBe('Maison');
            expect(place.devices).toEqual([]);
        });

        it('enregistre le lieu en base', () => {
            const place = service.createPlace({ name: 'Maison' });

            expect(service.getAllPlaces()).toEqual([place]);
        });
    });

    describe('getAllPlaces', () => {
        it('renvoie une liste vide quand aucun lieu n\'existe', () => {
            expect(service.getAllPlaces()).toEqual([]);
        });

        it('regroupe les cadres sous leur lieu et garde les lieux vides', () => {
            const maison = service.createPlace({ name: 'Maison' });
            const mamie = service.createPlace({ name: 'Mamie' });
            insertDevice('d1', 'Salon', maison.id);
            insertDevice('d2', 'Chambre', maison.id);

            const places = service.getAllPlaces();

            // Un seul « Maison » malgré ses deux lignes dans la jointure, et « Mamie » malgré l'absence de cadre
            expect(places.map(p => p.name)).toEqual(['Maison', 'Mamie']);
            // Cadres triés par nom
            expect(places[0]!.devices!.map(d => d.name)).toEqual(['Chambre', 'Salon']);
            expect(places[1]!.devices).toEqual([]);
        });
    });

    describe('getPlace', () => {
        it('renvoie le lieu demandé avec ses cadres complets', () => {
            const maison = service.createPlace({ name: 'Maison' });
            insertDevice('d1', 'Salon', maison.id);

            expect(service.getPlace(maison.id)).toEqual({
                id: maison.id,
                name: 'Maison',
                devices: [{ id: 'd1', name: 'Salon', mDNS: 'frame-d1', placeId: maison.id, createdAt: '2026-01-01T00:00:00.000Z' }],
            });
        });

        it('lève une ModelNotFoundException si le lieu n\'existe pas', () => {
            expect(() => service.getPlace('inconnu')).toThrow(ModelNotFoundException);
        });
    });

    describe('updatePlace', () => {
        it('renomme le lieu sans perdre ses cadres', () => {
            const maison = service.createPlace({ name: 'Maison' });
            insertDevice('d1', 'Salon', maison.id);

            const updated = service.updatePlace(maison.id, { name: 'Appartement' });

            expect(updated.name).toBe('Appartement');
            expect(updated.devices!.map(d => d.id)).toEqual(['d1']);
        });

        it('lève une ModelNotFoundException si le lieu n\'existe pas', () => {
            expect(() => service.updatePlace('inconnu', { name: 'Appartement' })).toThrow(ModelNotFoundException);
        });
    });

    describe('contrainte de clé étrangère', () => {
        it('refuse un cadre rattaché à un lieu inexistant', () => {
            expect(() => insertDevice('d1', 'Salon', 'inconnu')).toThrow('FOREIGN KEY');
        });

        it('refuse la suppression d\'un lieu qui contient des cadres', () => {
            const maison = service.createPlace({ name: 'Maison' });
            insertDevice('d1', 'Salon', maison.id);

            expect(() => db.prepare('DELETE FROM places WHERE id = ?').run(maison.id)).toThrow('FOREIGN KEY');
        });
    });
});
