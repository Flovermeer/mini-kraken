import type {FastifyInstance, FastifyPluginOptions} from "fastify";
import {PlaceService} from "../services/place.service.js";
import {getDb} from "../database/database.js";
import {getPlacesApiResponseSchema, getPlacesApiValidationSchema} from "../api/api.js";
import type {CreatePlaceRequest} from "../api/generated/models/CreatePlaceRequest.js";
import type {UpdatePlaceRequest} from "../api/generated/models/UpdatePlaceRequest.js";

export default async function placesRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {

    const placeService = new PlaceService(getDb());

    fastify.get('/places', {
        schema: {
            response: getPlacesApiResponseSchema('', 'get')
        }
    }, async (_request, reply) => {
       return reply.status(200).send(placeService.getAllPlaces());
    });

    fastify.get<{ Params: { id: string }}>('/places/:id', {
        schema: {
            response: getPlacesApiResponseSchema('/{id}', 'get')
        }
    }, async (request, reply) => {
        const id = request.params.id;
        return reply.status(200).send(placeService.getPlace(id));
    });

    fastify.post< { Body: CreatePlaceRequest }>('/places', {
        schema: {
            body: getPlacesApiValidationSchema('', 'post'),
            response: getPlacesApiResponseSchema('', 'post')
        }
    }, async (request, reply) => {
        return reply.status(201).send(placeService.createPlace(request.body));
    })


    fastify.patch< { Params: { id: string }, Body: UpdatePlaceRequest }>('/places/:id', {
        schema: {
            body: getPlacesApiValidationSchema('/{id}', 'patch'),
            response: getPlacesApiResponseSchema('/{id}', 'patch')
        }
    }, async (request, reply) => {
        const id = request.params.id;
        return reply.status(201).send(placeService.updatePlace(id, request.body));
    })
}