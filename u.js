var u = {

    ROLE: {}, //dynamically populated at end.

    FLAVOR_SHORT: "short",
    FLAVOR_MEDIUM: "medium",
    FLAVOR_LONG: "long",

    MAX_HISTORY: 10,

    MAX_WALL_REPAIR: 150000, //TO DO: This is a hack to make sure we don't repair walls endlessly (only up to 10000)

    getCreepAtPos: function(x, y) {
        var creepsAtPos = Game.spawns["Spawn1"].room.find(FIND_CREEPS, {
            filter: (creep) => {
                return (creep.pos.x == x && creep.pos.y == y);
            }
        });
        return creepsAtPos[0];
    },

    roleTarget: function(roleName, count, body) {
        return {
            "role": roleName,
            "count": count,
            "body": body
        };
    },

    goalStatus: function(goal, success, percent, status, message) {
      console.log("STATUS IS " + status);
        return {
            "goal": goal,
            "succeeded": success,
            "percent": percent,
            "status": status,
            "message": message,
        };
    },

    status: function(success, result, message) {
      return {
          "succeeded": success,
          "result": result,
          "message": message
      };
    },

    getWaitingCreeps: function() {
        var creepList = [];
        for (var creepname in Game.creeps) {
            if (Game.creeps[creepname].memory.behavior == "Waiting") {
                creepList.push(Game.creeps[creepname]);
            }
        }
        return creepList;
    },
    printAllCreepRolesAndBehaviors: function() {
        for (var creep in Game.creeps) {
            console.log(Game.creeps[creep].name + "..., role is " + Game.creeps[creep].memory.role + "..., behavior is " + Game.creeps[creep].memory.behavior);
        }
    },

    getCreepRolesAndCounts: function() {
        var creepRolesAndCounts = {};
        for (var creepName in Game.creeps) {
            var creep = Game.creeps[creepName];
            var role = creep.memory.role;
            //console.log("creep " + creep + " currently has role " + role);
            var currentCount = creepRolesAndCounts[role];
            //console.log("currentCount is " + currentCount);
            if (currentCount) {
                creepRolesAndCounts[role] = currentCount + 1;
            } else {
                creepRolesAndCounts[role] = 1;
            }
        }

        return creepRolesAndCounts;
    },

    recordHistory: function(creep, status) {
        if (! creep.memory.history) {
          creep.memory.history = [];
        }
        if (creep.memory.history.length >= this.MAX_HISTORY) {
            creep.memory.history.shift();
        }
        if (status && status["result"] && status["message"]) {
            creep.memory.history.push("" + Game.time + ": " + status["result"] + ", " + status["message"]);
        } else {
            creep.memory.history.push("malformed status, unable to show: " + status);
        }

        if (status && !status["succeeded"]) {
            creep.say(creep.memory.behavior);
        }
    },

    removeAllConstructionSites: function() {
        for (var c in Game.constructionSites) {
            Game.constructionSites[c].remove()
        };
    },

    getContainersOfType: function(flagType) {
        var containerFlagsOfType = Game.spawns["Spawn1"].room.find(FIND_FLAGS, {
            filter: (flag) => {
                return flag.name.includes(flagType);
            }
        });

        var containersOfType = [];
        for (var flagKey in containerFlagsOfType) {
            var flag = containerFlagsOfType[flagKey];
            var pos = flag.pos;
            var structuresAtFlag = pos.lookFor(LOOK_STRUCTURES);
            for (var structureKey in structuresAtFlag) {
                var structure = structuresAtFlag[structureKey];
                if (structure.structureType == STRUCTURE_CONTAINER) {
                    containersOfType.push(structure);
                }
            }
        }
        return containersOfType;
    },

    getPickupContainers: function() {
        return this.getContainersOfType("Pickup");
    },

    getDropoffContainers: function() {
        return this.getContainersOfType("Dropoff");
    },

    getFullestPickupContainer: function(creep) {
        var pickupContainers = this.getPickupContainers();

        var mostEnergyInContainer = -1;
        var fullestPickupContainer;
        for (var pickupContainerKey in pickupContainers) {

            var pickupContainer = pickupContainers[pickupContainerKey];
            if (pickupContainer.store[RESOURCE_ENERGY] > mostEnergyInContainer) {
                fullestPickupContainer = pickupContainer;
                mostEnergyInContainer = fullestPickupContainer.store[RESOURCE_ENERGY];
            } else if (pickupContainer.store[RESOURCE_ENERGY] == mostEnergyInContainer) {
                var closest = creep.pos.findClosestByPath([fullestPickupContainer, pickupContainer]);
                fullestPickupContainer = closest;
            }
        }
        return fullestPickupContainer;
    },

    getLowestDropoffContainer: function(creep) {
        var dropoffContainers = this.getDropoffContainers();

        var leastEnergyInContainer = 999999999999;
        var lowestDropoffContainer;
        for (var dropoffContainerKey in dropoffContainers) {

            var dropoffContainer = dropoffContainers[dropoffContainerKey];

            if (dropoffContainer.store[RESOURCE_ENERGY] < leastEnergyInContainer) {
                lowestDropoffContainer = dropoffContainer;
                leastEnergyInContainer = lowestDropoffContainer.store[RESOURCE_ENERGY];
            } else if (pickupContainer.store[RESOURCE_ENERGY] == mostEnergyInContainer) {
                var closest = creep.pos.findClosestByPath([fullestPickupContainer, pickupContainer]);
                fullestPickupContainer = closest;
            }
        }

        //console.log("lowest dropoff container: " + lowestDropoffContainer);
        return lowestDropoffContainer;
    },

    lowestHasRoom: function(lowest) {
        return lowest.store[RESOURCE_ENERGY] < lowest.storeCapacity;
    },

    getStorage: function(room) { //TODO: Deprecate this. Can there be more than one?
        return Game.spawns["Spawn1"].room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE)
            }
        })[0];
    },

    getStorages: function(room) {
        return room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE)
            }
        });
    },

    dropoffNeedsEnergy: function(lowest, fullest, storage, acceptable_pickup_dropoff_difference, acceptable_dropoff_emptiness) {
        var dropoffHasRoom = ((lowest.store[RESOURCE_ENERGY] / lowest.storeCapacity) < acceptable_dropoff_emptiness);
        var fullestHasEnergyInIt = fullest.store[RESOURCE_ENERGY] > 0;
        var dropoffLowComparedToPickup = lowest.store[RESOURCE_ENERGY] < (fullest.store[RESOURCE_ENERGY] - acceptable_pickup_dropoff_difference);
        //var dropoffLowComparedToStorage = storage.store[RESOURCE_ENERGY] < storage.store[RESOURCE_ENERGY]
        if (storage) {

        }
        var dropoffNeedsEnergy = lowest && fullest && dropoffLowComparedToPickup && fullestHasEnergyInIt && dropoffHasRoom;
        return dropoffNeedsEnergy;

    },


    clearFlagsContaining: function(string) {
        var containerFlagsOfType = Game.spawns["Spawn1"].room.find(FIND_FLAGS, {
            filter: (flag) => {
                return flag.name.includes(string);
            }
        });

        containerFlagsOfType.forEach(function(flag) {
            flag.remove();
        });
    },

    pickupTooFull: function(fullest, max_percent_capacity_before_storing) {
        return fullest && (fullest.store[RESOURCE_ENERGY] / fullest.storeCapacity) > max_percent_capacity_before_storing;
    },

    template: function(phase, name, template, cost) {
        return {
            "phase": phase,
            "name": name,
            "template": template,
            "cost": cost
        };
    },

    getTemplateCost: function(template) {
        var totalCost = 0;
        for (var i = 0; i < template["template"]; i++) {
            var item = template["template"][i];
            switch (item) {
                case WORK:
                    totalCost += 100;
                    break;
                case CARRY:
                    totalCost += 50;
                    break;
                case MOVE:
                    totalCost += 50;
                    break;
            }
        }
        return totalCost;
    },
};

//u.ROLE[WORKER] = "worker",
//u.ROLE[MAINTAINER_WORKER] = "maintainer worker",

//TODO: Has to be a better way than manually maintaining this.

u.ROLE.HARVESTER = "harvester";
u.ROLE.BUILDER = "builder";
u.ROLE.CONSTRUCTER = "constructer";
u.ROLE.FERRIER = "ferrier";
u.ROLE.REPAIRER = "repairer";
u.ROLE.UPGRADER = "upgrader";
u.ROLE.MINER = "miner";
u.ROLE.BLOCKER = "blocker";
u.ROLE.WORKER = "worker";

module.exports = u;
