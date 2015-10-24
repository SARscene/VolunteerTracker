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
let Request = require('superagent');

let liveUrl = "https://live-operations.center/api/publish/room_sarscene_ig0x26zl4s8?access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiJ1c2VyfjBpZzB3dGRwdSFpZzB3dGRwdXNvc2QwaGwiLCIkZG9jdHlwZSI6InVzZXIiLCIkb3BfdGltZSI6MTQ0NTQzODg2NjE0MywiJHNlcnZlcl9yZXYiOiIzLWIxNzk3NmVmNTNkZjg5OTc5YzkzNGQxMWNkZmMzYmRiIiwiZmlyc3RuYW1lIjoiU2Fyc2NlbmUiLCJ1c2VybmFtZSI6InNhcnNjZW5lIiwiZW1haWwiOiJqbkBxYXpzLmdxIiwib3JnIjoic2Fyc2NlbmUiLCJyb2xlcyI6WyJvcmdfc2Fyc2NlbmVfdXNlciJdLCJpYXQiOjE0NDU0Mzg4NjksImV4cCI6MTQ0NjA0MzY2OX0.1LW07d0axK3bDyedQzEefy5x57J8NZN-SzkA1fXd9Dg";

let server = new Hapi.Server();
server.connection({ port: 3000, routes: { cors: true } });

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
                description: "Get a list of searches in VolunteerTracker",
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
                        volunteerID: Joi.any().required(),
                        volunteerName: Joi.string().required(),
                        sequenceNumber: Joi.any(),
                        searchID: Joi.string().required(),
                        gpx: Joi.object().description('gpx data')
                    }
                },
                handler: function(request, reply) {
                    console.log(request.payload)

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

                    let livePayload = { 
                        "type": "info_item", 
                        "subtype": "search_teams", 
                        "action": "save", 
                        "document": { 
                            "_id": "info_item~search_teams~0ig55y99n!ig55y99n8cw6ar7",  
                            "$subtype": "search_teams", 
                            "name":"Team Alpha", 
                            "data": { 
                                "position": { 
                                    "lat": request.payload.gpx.trk.trkseg.trkpt['-lat'], 
                                    "lng": request.payload.gpx.trk.trkseg.trkpt['-lon']
                                } 
                            }
                        }
                    }

                    Request
                       .post(liveUrl)
                       .send(livePayload)
                       .set('Content-Type', 'application/json')
                       .set('Accept', 'application/json')
                       .end(function(err, res){
                         if (res.ok) {
                           console.log('yay got ' + JSON.stringify(res.body));
                         } else {
                           console.log('Oh no! error ' + res.text);
                         }
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
            path: '/api/points/{searchID}/{volunteerName}',
            config: {
                id: 'getPointsForVolunteer',
                validate: {
                    params: {
                        searchID: Joi.string().required().description('ID of the search'),
                        volunteerName: Joi.string().required().description('Name of the volunteer')
                    }
                },
                handler: function(request, reply) {

                    let data = [];
                    this.db.sublevel(request.params.searchID).createReadStream()
                        .on('data', function(chunk) {
                            if(chunk.value.volunteerName == request.params.volunteerName) {
                                data.push(chunk)
                            }
                        })
                        .on('end', function() {
                            return reply.calibrate(data);
                        });
                },
                description: "Get all map points associated with a search for a particular user",
                tags: ['api']
            }
        },

        // Load the control center UI
        {
            method: 'GET',
            path: '/{path*}',
            handler: {
                file: Path.join(__dirname, '/../../controlCenter/index.html')
            }
        },
        {
            method: 'GET',
            path: '/js/{param*}',
            handler: {
                directory: {
                    path: Path.join(__dirname, '/../../controlCenter/js')
                }
            }
        }, 
        {
            method: 'GET',
            path: '/css/{param*}',
            handler: {
                directory: {
                    path: Path.join(__dirname, '/../../controlCenter/css')
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