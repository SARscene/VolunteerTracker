app.filter('mapEmbedUrl', function ($sce) {
      return function(room) {
        return $sce.trustAsResourceUrl('https://32ec9b2e.ngrok.io/?id=' + room);
      };
    });


app.controller('StartCtrl', function($scope, $state)
{
  console.log('starting app');

  $scope.goToEntry = function()
  {
    console.log('starting');

    $state.go('app.entry');
  };
})


.controller('EntryCtrl', function($scope, $state, $personService)
{
  $scope.beingTracking = function(_name, _room)
  {
    console.log('start tracking');
    $personService.setName(_name);
    $personService.setRoom(_room);
    $personService.setID(new Date().getTime());
    console.dir($personService.getPerson());

    $state.go('app.tracking');
  };
})

.controller('TrackingCtrl', function($scope, $state, $interval, $personService, $pointService){
  var watchID = null;
  $scope.pointCount = 0;
  $scope.lastPoint = "loading first point...";
  $scope.room = $personService.getPerson().currentRoom;
  $scope.beingTracking = function()
  {
    console.log('tracking now');

    var options = {
      enableHighAccuracy: true
    };

    watchID = $interval(function() {
      navigator.geolocation.getCurrentPosition(
        function (position)
        {
          console.log('point received');
          $scope.lastPoint = $pointService.add(position);
          $scope.pointsCount = $pointService.getPointCount($personService.getPerson().currentRoom);
        },
        function (err)
        {
          console.log('failed to get point with error: ' + err.message);
        }
        , options);
    }, 5000);
  };

  $scope.beingTracking();

  $scope.endTracking = function()
  {
    console.log('end tracking');
    $interval.cancel(watchID);
    watchID = null;

    $state.go('app');
  };
});
