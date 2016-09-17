var tower = require('tower');


var hivemind = require('hivemind');


var runner = require("runner");

var u = require("u");

var roomManager = require("roomManager");

//TODO: Do role specific templates, just be smarter and DRY-er about this in general.


module.exports.loop = function() {

    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for (var spawnKey in Game.spawns) {
      var spawn = Game.spawns[spawnKey];
      var room = spawn.room;
      roomManager.addRoom(room);
    }

    var rooms = roomManager.getRooms();
    hivemind.think(rooms);

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        var creepRoom = creep.room;
        if (! roomManager.containsRoom(creepRoom)) {
          roomManager.addRoom(creepRoom);
        }
        runner.run(creep);
    }


    for (var room in rooms) {
      tower.run(room);
    }


}
