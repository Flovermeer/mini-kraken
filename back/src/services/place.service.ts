import type {DatabaseSync, SQLOutputValue} from "node:sqlite";
import type {Place} from "../api/generated/models/Place.js";
import type {Device} from "../api/generated/models/Device.js";
import type {CreatePlaceRequest} from "../api/generated/models/CreatePlaceRequest.js";
import {randomUUID} from "node:crypto";
import type {UpdatePlaceRequest} from "../api/generated/models/UpdatePlaceRequest.js";
import {ModelNotFoundException} from "../exceptions/ModelNotFoundException.js";

export class PlaceService {
    private readonly db: DatabaseSync;

    public constructor(db: DatabaseSync) {
        this.db = db;
    }

    public toPlace(raws: Record<string, SQLOutputValue>[]): Place {
        return {
            id: raws[0]!.place_id!.toString(),
            name: raws[0]!.place_name!.toString(),
            devices: raws.filter(r => r.device_id).map(d => {
                return {
                    id: d.device_id!.toString(),
                    name: d.device_name!.toString(),
                    mDNS: d.device_mDNS!.toString(),
                    placeId: d.device_place_id!.toString(),
                    createdAt: d.device_created_at!.toString()
                } satisfies Device
            }),
        }
    }

    getAllPlaces(): Place[] {
        const result = this.db.prepare(`
            SELECT
                places.id          AS place_id,
                places.name        AS place_name,
                devices.id         AS device_id,
                devices.name       AS device_name,
                devices.mDNS       AS device_mDNS,
                devices.place_id   AS device_place_id,
                devices.created_at AS device_created_at
            FROM places
                     LEFT JOIN devices ON devices.place_id = places.id
            ORDER BY places.name, devices.name;
        `).all();
        const placeIds: Set<string> = new Set(result.map(p => p.place_id) as string[]);
        return Array.from(placeIds).map(id => result.filter(p => p.place_id === id)).map(places => this.toPlace(places));
    }

    getPlace(id: string): Place {
        const result = this.db.prepare(`
            SELECT
                places.id          AS place_id,
                places.name        AS place_name,
                devices.id         AS device_id,
                devices.name       AS device_name,
                devices.mDNS       AS device_mDNS,
                devices.place_id   AS device_place_id,
                devices.created_at AS device_created_at
            FROM places
                     LEFT JOIN devices ON devices.place_id = places.id
            WHERE places.id = ?;
        `).all(id) ?? [];
        if (result.length < 1) {
            throw new ModelNotFoundException(`Place with id ${id} not found`);
        }
        return this.toPlace(result);
    }

    createPlace(request: CreatePlaceRequest): Place {
        const uuid = randomUUID();
        const place: Place = {
            id: uuid,
            name: request.name,
            devices: []
        };

        this.db.prepare('INSERT INTO places (id, name) VALUES (?, ?);')
            .run(place.id, place.name);

        return place;
    }

    updatePlace(id: string, request: UpdatePlaceRequest): Place {
        this.db.prepare('UPDATE places SET name = ? WHERE id = ?').run(request.name, id);
        return this.getPlace(id);
    }
}