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

.controller('TrackingCtrl', function($scope, $state){
  var watchID = null;
  $scope.points = [];
  $scope.lastPoint = "loading first point...";

  $scope.beingTracking = function()
  {
    console.log('tracking now');

    try
    {
      // setup gps watch
      watchID = navigator.geolocation.watchPosition(function(position){
          console.log('point received');
          console.dir(position);
          $scope.lastPoint = {
             latitude:          position.coords.latitude,
             longitude:         position.coords.longitude,
             altitude:          position.coords.altitude,
             accuracy:          position.coords.accuracy,
             altitudeAccuracy:  position.coords.altitudeAccuracy,
             heading:           position.coords.heading,
             speed:             position.coords.speed,
             timestamp:         position.timestamp
           };
          $scope.points.push($scope.lastPoint);

          $scope.$apply();
        },
        function(err){
          console.log('failed to get point with error: ' + err.message);
          alert("Error locating GPS coordinates with error: " + err.message);
        },
        { maximumAge: 10, timeout: 10, enableHighAccuracy: false });

    }
    catch(err)
    {
      var msg = 'Error thrown setting up GPS watch: '+ err.message;
      console.log(msg);
      alert(msg);
    }
  };

  $scope.beingTracking();

  $scope.endTracking = function()
  {
    console.log('end tracking');
  };
});
