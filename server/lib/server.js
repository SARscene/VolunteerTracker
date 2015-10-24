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
let Path = require('path');

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

    server.bind({ db: server.plugins['hapi-level'].db });

    server.subscription('/api/points/{searchID}');

    server.route([
        {
            method: 'GET',
            path: '/api/searches',
            config: {
                id: 'getSearches',
                handler: function(request, reply) {

                    let data = [];
                    this.db.sublevel('searchList').createReadStream()
                        .on('data', function(chunk) {
                            data.push({
                                searchID: chunk.value.searchID,
                                lastUpdated: new Date(chunk.value.lastUpdated).toISOString()
                            })
                        })
                        .on('end', function() {
                            return reply.calibrate(data);
                        });

                },
                tags: ['api']
            }
        },
        {
            method: 'POST',
            path: '/api/points',
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

                    let searchDB = this.db.sublevel(searchID);
                    let searchListDB = this.db.sublevel('searchList');

                    searchDB.put(key, request.payload, () => {

                        searchListDB.put(searchID, { searchID: searchID, lastUpdated: Date.now() }, () => {

                            server.publish(`/api/points/${searchID}`, { data: request.payload });
                            
                            return reply.calibrate({
                                message: 'Data Store',
                                point: request.payload
                            });
                        });
                    });
                },
                description: 'Add GPS Points',
                tags: ['api']
            }
        },   
        {
            method: 'GET',
            path: '/api/points/{searchID}',
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
        },
        {
            method: 'GET',
            path: '/{path*}',
            handler: {
                file: __dirname + '/../../controlCenter/index.html'
            }
        },
        {
            method: 'GET',
            path: '/js/{param*}',
            handler: {
                directory: {
                    path: __dirname + '/../../controlCenter/js'
                }
            }
        }, 
        {
            method: 'GET',
            path: '/css/{param*}',
            handler: {
                directory: {
                    path: __dirname + '/../../controlCenter/css'
                }
            }
        },
        {
            method: 'GET',
            path: '/js/nes.js',
            handler: {
                file: Path.join(__dirname, '../node_modules/nes/lib/client.js')
            }
        }
    ]);

    server.start(()=>{});
});