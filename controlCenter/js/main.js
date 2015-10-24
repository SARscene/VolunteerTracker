var VolTrack = (function () {

    var map = null;

    var volunteerCoords = {};

    var polylineOptions = {
        color: '#000'
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
        if (!volunteerCoords[volunteerId]) {
            volunteerCoords[volunteerId] = {coords: [], layer: null};

            volunteerCoords[volunteerId].layer = L.polyline(volunteerCoords[volunteerId].coords, polylineOptions);
        }

        volunteerCoords[volunteerId].coords.push({lat: lat, long: long, sequence: sequence});

        volunteerCoords[volunteerId].coords.sort(function (coordA, coordB) {
            return parseFloat(coordA.price) - parseFloat(coordB.price);
        });

        volunteerCoords[volunteerId].latLngList = [];
        volunteerCoords[volunteerId].coords.forEach(function (coord) {
            volunteerCoords[volunteerId].latLngList.push(L.latLng(coord.lat, coord.long));
        });

        map.removeLayer(volunteerCoords[volunteerId].layer);
        volunteerCoords[volunteerId].layer = L.polyline(volunteerCoords[volunteerId].latLngList, polylineOptions);
    };

    var drawVolunteerRoute = function (volunteerId) {
        volunteerCoords[volunteerId].layer.addTo(map);
    };


    return {initializeMap: initializeMap, addCoordinate: addCoordinate, drawVolunteerRoute: drawVolunteerRoute};
}());

(function () {
    // Centre roughly on the Rodd Hotel.
    VolTrack.initializeMap('map', 46.235, -63.131, 15);
    VolTrack.addCoordinate('user1', 46.235, -63.131);
    VolTrack.addCoordinate('user1', 46.237, -63.133);
    VolTrack.addCoordinate('user1', 46.239, -63.133);
    VolTrack.drawVolunteerRoute('user1');
    VolTrack.addCoordinate('user1', 46.239, -63.135);
    VolTrack.drawVolunteerRoute('user1');
    // TODO - implement drawAllRoutes
    // TODO - remove route before drawing if exists
    // TODO - drawAllRoutes should use drawVolunteerRoute, looping over volunteerCoord keys
}());


