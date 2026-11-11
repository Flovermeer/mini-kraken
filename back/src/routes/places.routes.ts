import type {FastifyInstance, FastifyPluginOptions} from "fastify";
import {PlaceService} from "../services/place.service.js";
import {getDb} from "../database/database.js";
import {getPlacesApiResponseSchema, getPlacesApiValidationSchema} from "../api/api.js";

export default async function placesRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {

    const placeService = new PlaceService(getDb());

    fastify.get('/places', {
        schema: {
            response: getPlacesApiResponseSchema('', 'get')
        }
    }, async (_request, reply) => {
       return reply.status(200).send(placeService.getAllPlaces());
    });

    fastify.post('/places', {
        schema: {
            body: getPlacesApiValidationSchema('', 'post'),
            response: getPlacesApiResponseSchema('', 'post')
        }
    }, async (request, reply) => {
        return reply.status(201).send(placeService.createPlace(request.body));
    })
}