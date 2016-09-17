
var roomManager = {

  managedRooms : {},

  addRoom: function(room) {
    this.managedRooms[room.name] = room;
  },

  getRooms: function() {
    return this.managedRooms;
  },

  containsRoom: function(room) {
    return this.managedRooms[room] != null;
  },
};

module.exports = roomManager;
