var u = require("u");


var tower = {
        run: function(room) {
            var towers = Game.spawns["Spawn1"].room.find(
                FIND_MY_STRUCTURES, {
                    filter: {
                        structureType: STRUCTURE_TOWER
                    }
                });

            towers.forEach(function(tower) {

                    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    if (closestHostile) {
                        console.log("ostensibly attacking");
                        console.log("here we go");
                        var result = tower.attack(closestHostile);
                        console.log("attack result: " + result);
                    }
                    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: function(structure) {
                          return (structure.structureType != STRUCTURE_WALL && (structure.hits < (structure.hitsMax / 3)) || structure.structureType == STRUCTURE_WALL && structure.hits < u.MAX_WALL_REPAIR / 3);
                        }
                    });
                    if (closestDamagedStructure) {
                        tower.repair(closestDamagedStructure);
                    }
                });
            }
        };

        module.exports = tower;
