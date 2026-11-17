import type {FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest} from "fastify";
import {DevicesDetectorService} from "../services/devices-detector.service.js";
import type {PairDeviceRequest} from "../api/generated/models/PairDeviceRequest.js";
import {DeviceService} from "../services/device.service.js";
import {getDb} from "../database/database.js";
import {getDevicesApiResponseSchema, getDevicesApiValidationSchema} from "../api/api.js";
import type {UpdateDeviceRequest} from "../api/generated/models/UpdateDeviceRequest.js";
import type {Device} from "../api/generated/models/Device.js";

export default async function devicesRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    const devicesDetectorService = new DevicesDetectorService();
    const deviceService = new DeviceService(getDb());

    //#region DEVICES
    fastify.get('/devices', {
        schema: {
            response: getDevicesApiResponseSchema('', 'get')
        }
    }, async (_request, reply) => {
        return reply.status(200).send(deviceService.pairedDevices());
    });

    fastify.patch< { Params: { id: string }, Body: UpdateDeviceRequest }>('/devices/:id', {
        schema: {
            response: getDevicesApiResponseSchema('/{id}', 'patch'),
            body: getDevicesApiValidationSchema('/{id}', 'patch')
        }
    }, async (request, reply) => {
        const id = request.params.id;
        const { name, placeId } = request.body;
        // Le contrat impose au moins un champ (minProperties: 1) : device sera forcément défini.
        let device: Device | undefined;
        // Le déplacement d'abord : c'est lui qui peut échouer (lieu inexistant → clé étrangère),
        // et on évite ainsi de renommer un cadre qu'on n'aura finalement pas pu déplacer.
        if (placeId !== undefined) device = deviceService.attachDeviceToPlace(id, placeId);
        if (name !== undefined) device = deviceService.updateDevice(id, name);
        return reply.status(201).send(device);
    });

    fastify.delete<{ Params: { id: string } }>('/devices/:id', {
       schema: {
           response: getDevicesApiResponseSchema('/{id}', 'delete'),
       }
    }, async (request, reply) => {
        deviceService.deleteDevice(request.params.id);
        return reply.status(204).send();
    });

    //#endregion

    //#region DISCOVERY
    fastify.post('/devices/discovery', {
        schema: { response: getDevicesApiResponseSchema('/discovery', 'post') },
    }, async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            devicesDetectorService.startDiscovery();
            await reply.status(202).send();
        } catch (error) {
            await reply.status(500).send("Failed to start discovery");
        }
    });

    fastify.delete('/devices/discovery', {
        schema: { response: getDevicesApiResponseSchema('/discovery', 'delete') },
    }, async (_request, reply) => {
        try {
            devicesDetectorService.stopDiscovery();
            await reply.status(202).send();
        } catch (error) {
            await reply.status(500).send("Failed to stop discovery");
        }
    });

    fastify.get('/devices/discovery', {
        schema: { response: getDevicesApiResponseSchema('/discovery', 'get') },
    }, async (_request: FastifyRequest, reply) => {
        const discovered = devicesDetectorService.discovered();
        const filtered = deviceService.filterAlreadyPairedDevices(discovered);
        await reply.status(200).send(filtered);
    });
    //#endregion

    //#region PAIRED
    fastify.post<{ Body: PairDeviceRequest }>('/devices', {
        schema: {
            body: getDevicesApiValidationSchema('', 'post'),
            response: getDevicesApiResponseSchema('', 'post'),
        },
    }, async (request, reply) => {
        return reply.status(201).send(deviceService.pairDevice(request.body));
    });
    //#endregion

}