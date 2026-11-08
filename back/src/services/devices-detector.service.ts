import type {DiscoveredDevice} from "../api/generated/models/DiscoveredDevice.js";
import {Bonjour, Browser, type Service} from 'bonjour-service'

type NetworkDevice = Pick<Service, "name" | "host" | "addresses" | "port"> & {
    id: string;
};

export class DevicesDetectorService {

    private readonly instance: Bonjour;
    private devices:  Map<string, NetworkDevice> = new Map();
    private activeSearch: Bonjour.Browser | null = null;
    private activeTimer: ReturnType<typeof setTimeout> | null = null;

    public constructor() {
        this.instance = new Bonjour();
    }


    public startDiscovery(): void {
        if (this.activeSearch) { return; }
        this.devices = new Map();
        this.activeTimer = setTimeout(() => this.stopDiscovery(), 60000);

        this.activeSearch = this.instance.find({
            type: "minikraken",
            protocol: "tcp"
        }, (service: Service) => {
            if (!service.txt.id || service.txt.id === "" ) return;
            this.devices.set(service.txt.id, {
                id: service.txt.id,
                name: service.name,
                host: service.host,
                addresses: service.addresses ?? [],
                port: service.port,
            });
        });
    }

    public stopDiscovery(): void {
        this.activeSearch?.stop();
        this.activeSearch = null;
        if (this.activeTimer) {
            clearTimeout(this.activeTimer);
        }
    }

     public discovered(): DiscoveredDevice[] {
         const devices = Array.from(this.devices.values());
         return devices.map(({ id, name }) => ({ id, name }));
    }
}