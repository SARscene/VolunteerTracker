app.controller('StartCtrl', function($scope, $state)
{
  console.log('starting app');

  $scope.goToEntry = function()
  {
    console.log('starting');

    $state.go('app.entry');
  };
})


.controller('EntryCtrl', function($scope, $state)
{
  $scope.beingTracking = function()
  {
    console.log('start tracking');

    $state.go('app.tracking');
  };
})

.controller('TrackingCtrl', function($scope, $state, $interval, $personService){
  var watchID = null;
  $scope.points = [];
  $scope.lastPoint = "loading first point...";

  $personService.setName('Ron');
  $personService.setRoom('pi');
  $personService.setID('1');

  console.dir($personService.getPerson());

  $scope.beingTracking = function()
  {
    console.log('tracking now');

    var options = {
      enableHighAccuracy: true
    };

    try
    {
      watchID = $interval(function() {
        navigator.geolocation.getCurrentPosition(function (position) {
            console.log('point received');
            console.dir(position);
            $scope.lastPoint = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
              timestamp: position.timestamp
            };
            $scope.points.push($scope.lastPoint);
          }, function (err) {
            console.log('failed to get point with error: ' + err.message);
          }
          , options);
      }, 1000);
    }
    catch(err)
    {
      var msg = 'Error thrown setting up GPS watch: '+ err.message;
      console.log(msg);
    }
  };

  $scope.beingTracking();

  $scope.endTracking = function()
  {
    console.log('end tracking');
    $interval.cancel(watchID);
  };
});
