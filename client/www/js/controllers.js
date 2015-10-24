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
  $scope.lastPoint = "loading first point...";

  $scope.beingTracking = function()
  {
    console.log('tracking now');

    watchID = navigator.geolocation.watchPosition(function(position){
        console.log('point received');
        console.dir(position);
        $scope.lastPoint = {
          lat: position.coords.latitude,
          long: position.coords.longitude,
          timestamp: position.timestamp
        };
        $scope.$apply();
      },
      function(){
        console.log('');
      },
      { maximumAge: 1000, timeout: 1000, enableHighAccuracy: true });

  };

  $scope.beingTracking();

  $scope.endTracking = function()
  {
    console.log('end tracking');
  };
});
