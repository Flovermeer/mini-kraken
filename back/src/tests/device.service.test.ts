import { describe, it, expect, beforeEach } from 'vitest';
import type { DatabaseSync } from 'node:sqlite';
import { DeviceService } from '../services/device.service.js';
import { ModelNotFoundException } from '../exceptions/ModelNotFoundException.js';
import type { DiscoveredDevice } from '../api/generated/models/DiscoveredDevice.js';
import { createTestDb } from './test-db.js';

describe('DeviceService', () => {
    let db: DatabaseSync;
    let service: DeviceService;

    // Un cadre appartient obligatoirement à un lieu : on en crée deux directement en SQL
    // (inutile de passer par PlaceService, ce n'est pas lui qu'on teste ici).
    const MAISON = '11111111-1111-1111-1111-111111111111';
    const MAMIE = '22222222-2222-2222-2222-222222222222';

    // Avant CHAQUE test : une base neuve et un service neuf.
    // Les tests ne se polluent donc pas entre eux.
    beforeEach(() => {
        db = createTestDb();
        db.prepare('INSERT INTO places (id, name) VALUES (?, ?), (?, ?)').run(MAISON, 'Maison', MAMIE, 'Mamie');
        service = new DeviceService(db);
    });

    describe('pairDevice', () => {
        it('renvoie le cadre appairé avec un UUID, le nom choisi, l\'id matériel et son lieu', () => {
            const device = service.pairDevice({ id: 'frame-0001', name: 'Cuisine', placeId: MAISON });

            expect(device.name).toBe('Cuisine');
            expect(device.mDNS).toBe('frame-0001');
            expect(device.placeId).toBe(MAISON);
            // L'id est un UUID généré par le serveur, pas l'id du cadre
            expect(device.id).toMatch(/^[0-9a-f-]{36}$/);
            expect(device.id).not.toBe('frame-0001');
            // createdAt est une date ISO 8601 valide
            expect(new Date(device.createdAt).toISOString()).toBe(device.createdAt);
        });

        it('enregistre le cadre en base', () => {
            const device = service.pairDevice({ id: 'frame-0001', name: 'Cuisine', placeId: MAISON });

            expect(service.pairedDevices()).toEqual([device]);
        });

        it('renvoie une erreur si le cadre est déjà enregistré en base', () => {
            service.pairDevice({ id: 'frame-0001', name: 'Cuisine', placeId: MAISON });
            expect(() => service.pairDevice({ id: 'frame-0001', name: 'Cuisine', placeId: MAISON })).toThrow('UNIQUE');
        });

        it('renvoie une erreur si le lieu n\'existe pas', () => {
            const unknownPlace = '99999999-9999-9999-9999-999999999999';
            expect(() => service.pairDevice({ id: 'frame-0001', name: 'Cuisine', placeId: unknownPlace })).toThrow('FOREIGN KEY');
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
            service.pairDevice({ id: 'frame-0001', name: 'Cuisine', placeId: MAISON });

            expect(service.filterAlreadyPairedDevices(discovered)).toEqual([
                { id: 'frame-0002', name: 'Cadre test 2' },
            ]);
        });
    });

    describe('attachDeviceToPlace', () => {
        it('déplace le cadre dans un autre lieu', () => {
            const device = service.pairDevice({ id: 'frame-0001', name: 'Cuisine', placeId: MAISON });

            const moved = service.attachDeviceToPlace(device.id, MAMIE);

            expect(moved.placeId).toBe(MAMIE);
            expect(service.pairedDevices()[0]!.placeId).toBe(MAMIE);
        });

        it('lève une ModelNotFoundException si le cadre n\'existe pas', () => {
            expect(() => service.attachDeviceToPlace('inconnu', MAMIE)).toThrow(ModelNotFoundException);
        });
    });
});
