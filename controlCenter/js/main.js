var VolTrack = (function () {
    'use strict';
    var map = null;

    var volunteerCoords = {};

    var initializeVolunteer = function (volunteerId) {

        if (!volunteerCoords[volunteerId]) {

            var getRandomColor = function () {
                var letters = '0123456789ABCDEF'.split('');
                var color = '#';
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            };

            volunteerCoords[volunteerId] = {
                coords: [],
                routeLayer: null,
                routeColor: getRandomColor(),
                name: volunteerId
            };

            //createVolunteerRouteLayer(volunteerId);
        }
    };

    var createVolunteerRouteLayer = function (volunteerId) {
        var latLngList = [];

        volunteerCoords[volunteerId].coords.forEach(function (coord) {
            latLngList.push(coord.latLng);
        });

        eraseVolunteerRoute(volunteerId);
        volunteerCoords[volunteerId].routeLayer = L.polyline(latLngList, {
            color: volunteerCoords[volunteerId].routeColor
        });
    };

    var createVolunteerLastKnownPinLayer = function (volunteerId) {
        var coordListLength = volunteerCoords[volunteerId].coords.length;
        var lngLang = null;

        if (coordListLength > 0) {
            lngLang = volunteerCoords[volunteerId].coords[coordListLength - 1].latLng;
            volunteerCoords[volunteerId].lastKnownPinLayer = L.marker(lngLang, {title: volunteerCoords[volunteerId].name});
        } else {
            volunteerCoords[volunteerId].lastKnownPinLayer = null;
        }
    };

    var initializeMap = function (domId, lat, long, zoom) {
        map = L.map(domId).setView([lat, long], zoom);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 30,
            id: 'volunteer-tracker.cig46mabs2e5bt9kvs91w2rfs',
            accessToken: 'pk.eyJ1Ijoidm9sdW50ZWVyLXRyYWNrZXIiLCJhIjoiY2lnNDZtYmxoMmVlb3U2bTQybDJsM211NiJ9._NVqiKhqmjuktJszvv6Q0Q'
        }).addTo(map);
    };

    var addCoordinate = function (volunteerId, lat, long, sequence) {
        initializeVolunteer(volunteerId);

        volunteerCoords[volunteerId].coords.push({latLng: L.latLng(lat, long), sequence: sequence});

        volunteerCoords[volunteerId].coords.sort(function (coordA, coordB) {
            return parseFloat(coordA.sequence) - parseFloat(coordB.sequence);
        });

        createVolunteerRouteLayer(volunteerId);
        createVolunteerLastKnownPinLayer(volunteerId);
    };

    var drawVolunteerRoute = function (volunteerId) {
        eraseVolunteerRoute(volunteerId);
        volunteerCoords[volunteerId].routeLayer.addTo(map);
        volunteerCoords[volunteerId].lastKnownPinLayer.addTo(map);
    };

    var drawAllVolunteerRoutes = function () {
        var allVolunteers = Object.keys(volunteerCoords);

        allVolunteers.forEach(function (volunteerId) {
            drawVolunteerRoute(volunteerId);
        });
    };

    var eraseVolunteerRoute = function (volunteerId) {
        if (volunteerCoords[volunteerId].routeLayer) {
            map.removeLayer(volunteerCoords[volunteerId].routeLayer);
        }
        if (volunteerCoords[volunteerId].lastKnownPinLayer) {
            map.removeLayer(volunteerCoords[volunteerId].lastKnownPinLayer);
        }
    };

    var changeVolunteerColor = function (volunteerId, color) {
        volunteerCoords[volunteerId].routeColor = color;
    };

    var changeVolunteerName = function (volunteerId, name) {
        volunteerCoords[volunteerId].name = name;
    };

    return {
        initializeMap: initializeMap,
        addCoordinate: addCoordinate,
        drawVolunteerRoute: drawVolunteerRoute,
        eraseVolunteerRoute: eraseVolunteerRoute,
        changeVolunteerColor: changeVolunteerColor,
        changeVolunteerName: changeVolunteerName,
        drawAllVolunteerRoutes: drawAllVolunteerRoutes
    };
}());

(function () {
    'use strict';

    // Centre roughly on the Rodd Hotel.
    VolTrack.initializeMap('map', 46.235, -63.131, 15);

    var getQueryParameter = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    var searchId = getQueryParameter('id') ? getQueryParameter('id') : 'general';
    var path = '/api/points/' + searchId;

    var socketHost = 'ws://' + window.location.hostname;

    var client = new nes.Client(socketHost);

    // Set an onConnect listener & connect to the service
    client.onConnect = function () {
        console.log('Service Connected');

        client.request({path: path}, function (err, res) {
            res.data.forEach(function (p) {

                var gps = {
                    lat: p.value.gpx.trk.trkseg.trkpt['-lat'],
                    lng: p.value.gpx.trk.trkseg.trkpt['-lon']
                };

                VolTrack.addCoordinate(p.value.volunteerName, gps.lat, gps.lng);
                VolTrack.changeVolunteerName(p.value.volunteerName, p.value.volunteerName);
            });

            VolTrack.drawAllVolunteerRoutes();
        });
    };

    client.connect(function (err) {
        if (err)
            console.log(err);
    });

    client.subscribe(path, function (err, data) {
        console.log(data.data);

        var gps = {
            lat: data.data.gpx.trk.trkseg.trkpt['-lat'],
            lng: data.data.gpx.trk.trkseg.trkpt['-lon']
        };

        VolTrack.addCoordinate(data.data.volunteerName, gps.lat, gps.lng);
        VolTrack.changeVolunteerName(data.data.volunteerName, data.data.volunteerName);
        if (data.data.sequenceNumber % 10 === 0) {
            VolTrack.drawVolunteerRoute(data.data.volunteerName);
        }
    });
}());

window.onresize = function(){ location.reload(); }
