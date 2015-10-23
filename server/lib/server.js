'use strict';

let Hapi = require('hapi');
let Nes = require('nes');
let Inert = require('inert');
let Blipp = require('blipp');
let Hoek = require('hoek');
let Vision = require('vision');
let Calibrate = require('calibrate');
let HapiSwagger = require('hapi-swagger');
let Joi = require('joi');

let server = new Hapi.Server();
server.connection({ port: 3000 });


let pointsStore = {};

server.register([ Nes, Inert, Blipp, Vision, HapiSwagger, Calibrate.decorate ], () => {

    //server.subscription('/map/{id}');

    server.route([
            {
                method: 'POST',
                path: '/points',
                config: {
                    id: 'storePoint',
                    validate: {
                        payload: {
                            volunteerID: Joi.string(),
                            sequenceNumber: Joi.string(),
                            searchID: Joi.string(),
                            gpx: Joi.object().description('gpx data')
                        }
                    },
                    handler: (request, reply) => {

                        let searchID = request.payload.searchID;

                        if(!pointsStore[searchID]) {
                            pointsStore[searchID] = [];
                        }

                        pointsStore[searchID].push(request.payload);
                        
                        //server.publish(`/map/${roomId}`, { message: request.payload.message });
                        return reply.calibrate({
                            message: 'Data Store',
                            point: request.payload
                        });
                    },
                    description: 'Add GPS Points',
                    tags: ['api']
                }
            }
        ,   {
                method: 'GET',
                path: '/points',
                config: {
                    id: 'getAllPoints',
                    handler: (request, reply) => {

                        return reply.calibrate(pointsStore);
                    },
                    description: 'Returns a list of GPS Points',
                    tags: ['api']
                }
            }
        ,   {
                method: 'GET',
                path: '/points/{searchID}',
                config: {
                    id: 'getPoints',
                    validate: {
                        params: {
                            searchID: Joi.string().required().description('ID of the search')
                        }
                    },
                    handler: (request, reply) => {

                        return reply.calibrate(pointsStore[request.params.searchID])
                    },
                    description: "Get all map points associated with a search",
                    tags: ['api']
                }
            }   
    ]);

    server.start(()=>{});
});