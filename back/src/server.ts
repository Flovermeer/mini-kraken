import Fastify from "fastify";
import cors from "@fastify/cors";
import {fastifyMultipart} from "@fastify/multipart";
import photoRoutes from "./routes/photos.routes.js";
import devicesRoutes from "./routes/devices.routes.js";
import placesRoutes from "./routes/places.routes.js";
import {errorHandler} from "./error-handler.js";

const fastify = Fastify({
    logger: true, 
});

fastify.register(fastifyMultipart, {
    limits: {
        fileSize: (5 * 1024 * 1024)
    }
});
fastify.register(cors, { origin: "*", methods: ["GET", "POST", "DELETE", "PATCH"] });
fastify.register(photoRoutes);
fastify.register(devicesRoutes);
fastify.register(placesRoutes);

errorHandler(fastify);

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