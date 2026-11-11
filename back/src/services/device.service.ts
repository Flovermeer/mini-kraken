import type {DiscoveredDevice} from "../api/generated/models/DiscoveredDevice.js";
import type {Device} from "../api/generated/models/Device.js";
import {randomUUID} from "node:crypto";
import type {DatabaseSync, SQLOutputValue} from "node:sqlite";
import type {PairDeviceRequest} from "../api/generated/models/PairDeviceRequest.js";
import {ModelNotFoundException} from "../exceptions/ModelNotFoundException.js";

export class DeviceService {

    private readonly db: DatabaseSync;

    public constructor(db: DatabaseSync) {
        this.db = db;
    }

    public toDevice(raw: Record<string, SQLOutputValue>): Device {
        return {
            id: raw.id!.toString(),
            name: raw.name!.toString(),
            mDNS: raw.mDNS!.toString(),
            created_at: raw.created_at!.toString(),
        } satisfies Device;
    }


    pairDevice(discovered: PairDeviceRequest): Device {
        const uuid = randomUUID();
        const device: Device = {
            id: uuid,
            name: discovered.name,
            mDNS: discovered.id,
            created_at: new Date().toISOString(),
        }

        this.db.prepare('INSERT INTO devices (id, name, mDNS, created_at) VALUES (?, ?, ?, ?);')
            .run(device.id, device.name, device.mDNS, device.created_at);

        return device;
    }

    pairedDevices(): Device[] {
        const result = this.db.prepare('SELECT * FROM devices').all();
        return result.map(raw => this.toDevice(raw));
    }

    filterAlreadyPairedDevices(discovered: DiscoveredDevice[]): DiscoveredDevice[] {
        const existingMDNS = new Set(this.pairedDevices().map(device => device.mDNS));
        return discovered.filter((device: DiscoveredDevice) => !existingMDNS.has(device.id));
    }

    updateDevice(id: string, name: string) {
        this.db.prepare('UPDATE devices SET name = ? WHERE id = ?').run(name, id);
        const result = this.db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
        if (!result) throw new ModelNotFoundException(`Device with id ${id} not found`);
        return this.toDevice(result);
    }

    deleteDevice(id: string) {
        const result = this.db.prepare('DELETE FROM devices WHERE id = ?').run(id);
        if (result.changes === 0) throw new ModelNotFoundException(`Device with id ${id} not found`);
        return;
    }
}