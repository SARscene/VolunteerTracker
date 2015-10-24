angular.module('app')

  .factory('$personService', [function() {
    var person = {
      volunteerID: '',
      volunteerName: '',
      currentRoom: ''
    };

    // todo - load person from local storage

    return {
      setID: function(volunteerIDP)
      {
        person.volunteerID = volunteerIDP;

        // todo update local storage
      },
      setName: function(volunteerNameP) {
        person.volunteerName = volunteerNameP;

        // todo update local storage
      },
      setRoom: function(currentRoomP)
      {
        person.currentRoom = currentRoomP;

        // todo update local storage
      },
      getPerson: function()
      {
        return person;
      }
    }
  }]);
