import type {FastifyInstance} from "fastify";
import {ModelNotFoundException} from "./exceptions/ModelNotFoundException.js";
import {ImageNotStoredException} from "./exceptions/ImageNotStoredException.js";
import {TooManyFilesException} from "./exceptions/TooManyFilesException.js";

export function errorHandler(fastify: FastifyInstance) {
    return fastify.setErrorHandler(async (error, _request, reply) => {
        if (error instanceof ModelNotFoundException) {
            return await reply.status(404).send({
                error: error.message
            });
        }
        if (error instanceof ImageNotStoredException) {
            return await reply.status(500).send({
                error: error.message
            })
        }
        if (error instanceof TooManyFilesException) {
            return await reply.status(409).send({
                error: error.message
            })
        }
        await reply.send(error);
    });
}