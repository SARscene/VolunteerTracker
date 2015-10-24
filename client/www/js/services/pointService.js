angular.module('app')

  .factory('$pointService', ['$http', function($http) {
    var current_points = [];

    // todo - load current points from local storage

    return {
      add: function(point) {
        current_points.push(point);

        // todo update local storage

        // if at a point to where we want to push then push

        return this;
      }
    }
  }]);
