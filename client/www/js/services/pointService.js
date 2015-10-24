angular.module('app')

  .factory('$pointService', ['$http', '$personService', function($http, $personService) {
    var current_points = [],
        point_index = 0;

    // todo - load current points from local storage

    return {
      add: function(position) {
        point_index++;
        position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };

        current_points.push(position);

        // todo update local storage

        var person = $personService.getPerson();
        // this is just for a demo - POST ALL THE THINGS
        $http.post('https://32ec9b2e.ngrok.io/api/points', {
          "volunteerID": person.volunteerID,
          "volunteerName": person.volunteerName,
          "sequenceNumber": point_index,
          "searchID": person.currentRoom,
          "gpx": {
            "trk": {
              "name": "Volunteer incremental payload ver 0.1",
              "trkseg": {
                "trkpt": {
                  "-lat": position.latitude,
                  "-lon": position.longitude,
                  "ele": position.height,
                  "time": position.timestamp
                }
              }
            }
          }
        }).then(function(data){
          console.log('posted');
          console.dir(data);
        }, function(err){
          console.log('http failure:');
          console.dir(err);
        });

        return position;
      },
      getPointCount: function(roomID)
      {
        return current_points.length;
      }
    }
  }]);
