import type {FastifyInstance, FastifyPluginOptions} from "fastify";
import fs from "fs";
import path from "node:path";
import { getAllowedMimeType, mimeTypeGuardFn } from "../guards/mime-type.guards.js";
import {PhotosManagerService} from "../services/photos-manager.service.js";
import {DeviceService} from "../services/device.service.js";
import {getDb} from "../database/database.js";

export default async function photosRoutes (fastify: FastifyInstance, _options: FastifyPluginOptions) {
    const dir = path.resolve(process.cwd(), 'uploads');
    const deviceService = new DeviceService(getDb());
    const photoManager = new PhotosManagerService();
    
    fastify.post('/devices/:deviceId/photos', async (request, reply) => {
        const { deviceId } = request.params as { deviceId: string };
        const data = await request.file();

        if (data?.file === undefined) {
            await reply.status(400).send({ error: 'No file uploaded' });
            return;
        }    

        if (!mimeTypeGuardFn(data.mimetype)) {
            await reply.status(400).send({ error: 'Invalid file type' });
            return;
        }

        if (!deviceService.deviceExists(deviceId)) {
            await reply.status(404).send({ error: 'Device not found' });
            return;
        }

        await photoManager.handleUploadedPhoto(deviceId, await data.toBuffer());
        await reply.status(201).send();
    });

    fastify.get('/devices/:deviceId/photos', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer', maximum: 50, minimum: 1, default: 1 }
                }
            }
        }
    }, async (request, reply) => {
        const { deviceId } = request.params as { deviceId: string };
        const { page } = (request.query ) as { page: number };
        if (!deviceService.deviceExists(deviceId)) {
            await reply.status(404).send({ error: 'Device not found' });
            return;
        }
        const result = await photoManager.getThumbnailsForDevice(deviceId, page ?? 1);
        await reply.status(200).send(result);
    });

    fastify.get('/photos/:id', (request, reply) => {
        const { id } = request.params as { id: string };
        const filePath = fs.readdirSync(dir).find(file => file.startsWith(id));

        if (filePath === undefined) {
            reply.status(404).send({ message: 'File not found' });
            return;
        }

        const fullPath = path.join(dir, filePath);
        const stream = fs.createReadStream(fullPath);

        reply
        .type(getAllowedMimeType(filePath))
        .send(stream);
    });
};