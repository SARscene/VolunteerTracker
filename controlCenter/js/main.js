var VolTrack = (function () {
    'use strict';
    var map = null;

    var volunteerCoords = {};

    var polylineOptions = {
        color: '#000'
    };

    var initializeVoluteer = function (volunteerId) {

        if (!volunteerCoords[volunteerId]) {
            volunteerCoords[volunteerId] = {coords: [], routeLayer: null};

            volunteerCoords[volunteerId].routeLayer = L.polyline(volunteerCoords[volunteerId].coords, polylineOptions);
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
        var latLngList = [];

        initializeVoluteer(volunteerId);

        volunteerCoords[volunteerId].coords.push({latLng: L.latLng(lat, long), sequence: sequence});

        volunteerCoords[volunteerId].coords.sort(function (coordA, coordB) {
            return parseFloat(coordA.sequence) - parseFloat(coordB.sequence);
        });

        volunteerCoords[volunteerId].coords.forEach(function (coord) {
            latLngList.push(coord.latLng);
        });

        map.removeLayer(volunteerCoords[volunteerId].routeLayer);
        volunteerCoords[volunteerId].routeLayer = L.polyline(latLngList, polylineOptions);
    };

    var drawVolunteerRoute = function (volunteerId) {
        eraseVolunteerRoute(volunteerId);
        volunteerCoords[volunteerId].routeLayer.addTo(map);
    };

    var eraseVolunteerRoute = function (volunteerId) {
        if (volunteerCoords[volunteerId].routeLayer) {
            map.removeLayer(volunteerCoords[volunteerId].routeLayer);
        }
    };


    return {
        initializeMap: initializeMap,
        addCoordinate: addCoordinate,
        drawVolunteerRoute: drawVolunteerRoute,
        eraseVolunteerRoute: eraseVolunteerRoute
    };
}());

(function () {
    'use strict';
    // Centre roughly on the Rodd Hotel.
    VolTrack.initializeMap('map', 46.235, -63.131, 15);
    // VolTrack.addCoordinate('user1', 46.235, -63.131);
    // VolTrack.addCoordinate('user1', 46.237, -63.133);
    // VolTrack.addCoordinate('user1', 46.239, -63.133);
    // VolTrack.drawVolunteerRoute('user1');
    // VolTrack.addCoordinate('user1', 46.239, -63.135);
    // VolTrack.drawVolunteerRoute('user1');
    // TODO - implement drawAllRoutes
    // TODO - drawAllRoutes should use drawVolunteerRoute, looping over volunteerCoord keys

    var getQueryParameter = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    var searchId = getQueryParameter('id') ? getQueryParameter('id') : 'general';
    var path = '/api/points/' + searchId

    var client = new nes.Client('ws://localhost:3000');

    // Set an onConnect listener & connect to the service
    client.onConnect = function () {
        console.log('Service Connected');

        client.request({path: path}, function (err, res) {
            res.data.forEach(function (p) {

                var gps = {
                    lat: p.value.gpx.trk.trkseg.trkpt['-lat'],
                    lng: p.value.gpx.trk.trkseg.trkpt['-lon']
                }

                VolTrack.addCoordinate('user1', gps.lat, gps.lng);
                VolTrack.drawVolunteerRoute('user1');

            });
        });
    };

    client.connect(function (err) {
        if (err)
            console.log(err)
    });

    client.subscribe(path, function (err, data) {
        console.log(data.data)

        var gps = {
            lat: data.data.gpx.trk.trkseg.trkpt['-lat'],
            lng: data.data.gpx.trk.trkseg.trkpt['-lon']
        }

        VolTrack.addCoordinate('user1', gps.lat, gps.lng);
        VolTrack.drawVolunteerRoute('user1');
    });
}());



