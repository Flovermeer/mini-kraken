import Fastify from "fastify";
import cors from "@fastify/cors";
import {fastifyMultipart} from "@fastify/multipart";
import photoRoutes from "./routes/photos.routes.js";
import devicesRoutes from "./routes/devices.routes.js";
import {ModelNotFoundException} from "./exceptions/ModelNotFoundException.js";

const fastify = Fastify({
    logger: true, 
});

fastify.register(fastifyMultipart);
fastify.register(cors, { origin: "*", methods: ["GET", "POST", "DELETE", "PATCH"] });
fastify.register(photoRoutes);
fastify.register(devicesRoutes);

fastify.setErrorHandler(async (error, _request, reply) => {
    if (error instanceof ModelNotFoundException) {
        return await reply.status(404).send({
            error: error.message
        });
    }
    await reply.send(error);
});


fastify.get('/health', (_request, reply) => {
    reply.send({ status: 'ok' });
});

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});