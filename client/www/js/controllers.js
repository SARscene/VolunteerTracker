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
  $scope.beingTracking = function()
  {
    console.log('tracking now');
  };
});
