import type {FastifyInstance, FastifyPluginOptions} from "fastify";
import fs from "fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { pipeline } from "stream/promises";
import { getAllowedMimeType, mimeTypeGuardFn } from "../guards/mime-type.guards.js";

export default async function photosRoutes (fastify: FastifyInstance, _options: FastifyPluginOptions) {
    const dir = path.resolve(process.cwd(), 'uploads');
    
    fastify.post('/photos', async (request, reply) => {
        const data = await request.file();
        const fileName = data?.filename;

        if (data?.file === undefined) {
            reply.status(400).send({ message: 'No file uploaded' });
            return;
        }    

        if (!mimeTypeGuardFn(data.mimetype)) {
            reply.status(400).send({ message: 'Invalid file type' });
            return;
        }

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    
        const filePath = `${dir}/${randomUUID()}${data.mimetype.replace('/', '.')}`;
        await pipeline(data.file, fs.createWriteStream(filePath));
        reply.send({ message: 'File uploaded successfully', fileName });
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