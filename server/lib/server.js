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
let HapiLevel = require('hapi-level');

let server = new Hapi.Server();
server.connection({ port: 3000 });

server.register([ 
        Nes, 
        Inert, 
        Blipp, 
        Vision, 
        HapiSwagger, 
        Calibrate.decorate, 
        { register: HapiLevel, options: { path: './temp', config: { valueEncoding: 'json' } }} 
    ], () => {

    server.bind({ db: server.plugins['hapi-level'].db })

    server.route([
            {
                method: 'POST',
                path: '/points',
                config: {
                    id: 'storePoint',
                    validate: {
                        payload: {
                            volunteerID: Joi.string(),
                            volunteerName: Joi.string(),
                            sequenceNumber: Joi.string(),
                            searchID: Joi.string().required(),
                            gpx: Joi.object().description('gpx data')
                        }
                    },
                    handler: function(request, reply) {
                        let searchID = request.payload.searchID;
                        let key = '' + Date.now();

                        let db = this.db.sublevel(searchID);

                        db.put(key, request.payload, function() {
                            return reply.calibrate({
                                message: 'Data Store',
                                point: request.payload
                            });
                        });
                        
                        //server.publish(`/map/${roomId}`, { message: request.payload.message });
                        
                    },
                    description: 'Add GPS Points',
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
                    handler: function(request, reply) {

                        let data = [];
                        this.db.sublevel(request.params.searchID).createReadStream()
                            .on('data', function(chunk) {
                                data.push(chunk)
                            })
                            .on('end', function() {
                                return reply.calibrate(data);
                            });
                    },
                    description: "Get all map points associated with a search",
                    tags: ['api']
                }
            }   
    ]);

    server.start(()=>{});
});