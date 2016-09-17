var u = require('u');
var flags = require("flags");

var behaviors = {

    HARVESTING: "Harvesting",
    CONSTRUCTING: "Constructing",
    RETURNING: "Returning",
    UPGRADING: "Upgrading",
    REPAIRING: "Repairing",
    WITHDRAWING: "Withdrawing",
    FORAGING: "Foraging",
    WAITING: "Waiting",
    PICKUPING: "Pickuping",
    DROPOFFING: "Dropoffing",
    TRANSFERRING_TO_NEAREST_SPAWN: "Transfer Sp",
    TRANSFERRING_TO_NEAREST_CONTAINER: "Transfer C",
    MOVING_TO_FLAG: "Moving to flag",

    STATUS_FULLENERGY: "Full of energy",
    STATUS_NOENERGY: "Not enough energy to perform function",

    STATUS_NOVALIDTARGETS: "No Valid Targets",
    STATUS_NOPATH: "No path to targets",

    STATUS_NOT_ENOUGH_RESOURCES: "Not any (or enough?) resources in the source.",

    STATUS_ONTHEWAY: "Moving towards target",
    STATUS_PERFORMEDACTION: "Performed Behavior Action",

    STATUS_NOTHINGTOWITHDRAW: "Nothing to withdraw",

    STATUS_UNKNOWN_PROBLEM: "Unknown Problem",

    MAX_TRIES: 5,

    //TODO: Need to handle case where there is no energy left in source. Probably still just sit there though.

    //{"succeeded": true, "result" : SOME_STATUS, "message" : "human readable string"}

    //TODO: Maybe have them hang out in a waiting zone.

    CLOSE_ENOUGH_TO_WAITING_ROOM: 3,

    wait: function(creep) {
        var waitingRooms = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return flag.name.includes("Waiting Room");
            }
        });

        if (waitingRooms.length == 0) {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "Apparently no waiting rooms in this room.");
        }
        var closestWaitingRoom = creep.pos.findClosestByPath(waitingRooms);

        if (closestWaitingRoom == null) {
            return u.status(false, this.STATUS_NOPATH, "Can't find a waiting room I can reach.");
        }

        var rangeToWaitingRoom = creep.pos.getRangeTo(closestWaitingRoom)
        if (rangeToWaitingRoom < this.CLOSE_ENOUGH_TO_WAITING_ROOM) {
            return u.status(true, this.STATUS_PERFORMEDACTION, "Waiting within " + this.CLOSE_ENOUGH_TO_WAITING_ROOM + " of waiting room at " + closestWaitingRoom.pos.x + "," + closestWaitingRoom.pos.y);
        } else {
            creep.moveTo(closestWaitingRoom);
            return u.status(true, this.STATUS_ONTHEWAY, "Moving to waiting room " + rangeToWaitingRoom + " spaces away at " + closestWaitingRoom.pos.x + "," + closestWaitingRoom.pos.y);
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");


    },

    transferToNearestSpawn: function(creep) {
        if (creep.carry.energy == 0) {
            return u.status(true, this.STATUS_NOENERGY, "This creep has no more energy to transfer to spawn. (" + creep.carry.energy + "/" + creep.carryCapacity + ")");
        }

        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.storeCapacity;
            }
        });
        var targetPlaceToTransfer = creep.pos.findClosestByPath(targets);

        if (!targetPlaceToTransfer) {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "Extensions and spawns are completely full.");
        }

        var transferResult = creep.transfer(targetPlaceToTransfer, RESOURCE_ENERGY);

        if (transferResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetPlaceToTransfer);
            return u.status(true, this.STATUS_ONTHEWAY, "Moving toward extension or spawn to transfer.");
        } else if (transferResult == OK) {
            return u.status(true, this.STATUS_PERFORMEDACTION, "Transferred energy to spawn or extension. Creep has " + creep.carry.energy + "/" + creep.carryCapacity + ". Structure has " + targetPlaceToTransfer.energy + "/" + targetPlaceToTransfer.storeCapacity);
        } else {
            return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Encountered unknown problem when trying to transfer to target: " + transferResult);
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method");

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    //also counts storage as a container.
    transferToNearestContainer: function(creep) {
        if (creep.carry.energy == 0) {
            return u.status(true, this.STATUS_NOENERGY, "This creep has no more energy to transfer to container. (" + creep.carry.energy + "/" + creep.carryCapacity + ")");
        }

        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER ||
                    structure.structureTpye == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
            }
        });
        var targetPlaceToTransfer = creep.pos.findClosestByPath(targets);

        if (!targetPlaceToTransfer) {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "Containers do not exist, or are completely full.");
        }

        var transferResult = creep.transfer(targetPlaceToTransfer, RESOURCE_ENERGY);

        if (transferResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetPlaceToTransfer);
            return u.status(true, this.STATUS_ONTHEWAY, "Moving toward container to transfer.");
        } else if (transferResult == OK) {
            return u.status(true, this.STATUS_PERFORMEDACTION, "Transferred energy to container. Creep has " + creep.carry.energy + "/" + creep.carryCapacity + ". Structure has " + targetPlaceToTransfer.store[RESOURCE_ENERGY] + "/" + targetPlaceToTransfer.storeCapacity);
        } else {
            return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Encountered unknown problem when trying to transfer to target: " + transferResult);
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method");

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    transferToNearestStorage: function(creep) {
        if (creep.carry.energy == 0) {
            return u.status(true, this.STATUS_NOENERGY, "This creep has no more energy to transfer to container. (" + creep.carry.energy + "/" + creep.carryCapacity + ")");
        }

        var targets = u.getStorage();

        var targetPlaceToTransfer = creep.pos.findClosestByPath(targets);

        if (!targetPlaceToTransfer) {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "Storage does not exist.");
        }

        var transferResult = creep.transfer(targetPlaceToTransfer, RESOURCE_ENERGY);

        if (transferResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetPlaceToTransfer);
            return u.status(true, this.STATUS_ONTHEWAY, "Moving toward container to transfer.");
        } else if (transferResult == OK) {
            return u.status(true, this.STATUS_PERFORMEDACTION, "Transferred energy to container. Creep has " + creep.carry.energy + "/" + creep.carryCapacity + ". Structure has " + targetPlaceToTransfer.store[RESOURCE_ENERGY] + "/" + targetPlaceToTransfer.storeCapacity);
        } else {
            return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Encountered unknown problem when trying to transfer to target: " + transferResult);
        }


        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    //TODO: Make smart about transferring and harvesting on same turn.
    harvest: function(creep, varargs) {
        //TODO: Probably a cleaner way to do this.
        var stick_to_empty;
        if (varargs) {
            if (varargs["stick_to_empty"]) {
                stick_to_empty = varargs["stick_to_empty"];
            }
        }

        if (creep.carry.energy == creep.carryCapacity) {
            return u.status(true, this.STATUS_FULLENERGY, "This creep has no more energy capacity left to harvest. (" + creep.carry.energy + "," + creep.carryCapacity + ")");
        }

        if (stick_to_empty) {
            var sources = creep.room.find(FIND_SOURCES);
        } else {
            var sources = creep.room.find(FIND_SOURCES, {
                filter: (source) => {
                    return (source.energy > 0);
                }
            });
        }


        if (sources.length == 0) {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "No energy sources in this room, or no sources with any energy left to harvest.");
        }

        var targetSource = creep.pos.findClosestByPath(sources);
        if (targetSource == null) {
            return u.status(false, this.STATUS_NOPATH, "" + sources.length + " sources exist, but no paths to any in room.");
        }

        var rangeToSource = creep.pos.getRangeTo(targetSource);

        var harvestResult = creep.harvest(targetSource);
        if (harvestResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetSource);
            return u.status(true, this.STATUS_ONTHEWAY, "On the way to an energy source (" + rangeToSource + " away, " + targetSource.energy + "/" + targetSource.energyCapacity + "energy). Creep has " + creep.carry.energy + "/" + creep.carryCapacity);
        } else if (harvestResult == ERR_NOT_ENOUGH_RESOURCES) {
            if (stick_to_empty) {
                creep.moveTo(targetSource);
            }
            return u.status(false, this.STATUS_NOT_ENOUGH_RESOURCES, "No resource in source to harvest. (" + targetSource.energy + "/" + targetSource.energyCapacity + ")");
        } else {
            return u.status(true, this.STATUS_PERFORMEDACTION, "Harvested energy from source at " + targetSource.pos.x + "," + targetSource.pos.y + ". Creep has " + creep.carry.energy + "/" + creep.carryCapacity);
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    return: function(creep) {
        if (creep.carry.energy == 0) {
            return u.status(true, this.STATUS_NOENERGY, "This creep has no more energy to return. (" + creep.carry.energy + "/" + creep.carryCapacity + ")");
        }
        //Return the energy to somewhere
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.storeCapacity) ||
                    ((structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity);
            }
        });
        
        var targetPlaceToReturn = creep.pos.findClosestByPath(targets);
        if (targetPlaceToReturn) {
            if (creep.transfer(targetPlaceToReturn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetPlaceToReturn);
                return u.status(true, this.STATUS_ONTHEWAY, "Moving towards an extension, spawn, or tower to return energy.");
            } else {
                return u.status(true, this.STATUS_PERFORMEDACTION, "Returning energy to an extension, spawn, or tower. Creep has " + creep.carry.energy + "/" + creep.carryCapacity + ". Structure has " + targetPlaceToReturn.energy + "/" + targetPlaceToReturn.storeCapacity);
            }
        } else {
            //try a container as a backup
            var nonEmptyContainers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                }
            });

            if (nonEmptyContainers.length == 0) {
                return u.status(false, this.STATUS_NOVALIDTARGETS, "Could not find a container with any room remaining (or, previously, an extension, spawn, or tower)");
            }
            var closestContainer = creep.pos.findClosestByPath(nonEmptyContainers);
            if (closestContainer == null) {
                return u.status(false, this.STATUS_NOPATH, "Found a container, but there is currently no path to it.");
            }

            if (creep.transfer(closestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestContainer);
                return u.status(true, this.STATUS_ONTHEWAY, "Moving to non-full container");
            } else {
                return u.status(true, this.STATUS_PERFORMEDACTION, "Stored energy in the container")
            }
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    construct: function(creep) {

        if (creep.carry.energy == 0) {
            return u.status(true, this.STATUS_NOENERGY, "This creep has no more energy capacity left to construct.");
        }

        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length == 0) {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "No construction sites in this room to construct at.");
        }

        var closestConstructionSite = creep.pos.findClosestByPath(targets);

        if (closestConstructionSite == null) {
            return u.status(false, this.STATUS_NOPATH, "There are construction sites, but none are reachable currently.");
        }

        if (creep.build(closestConstructionSite) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestConstructionSite);
            return u.status(true, this.STATUS_ONTHEWAY, "On the way to the closest construction site.");
        } else {
            return u.status(true, this.STATUS_PERFORMEDACTION, "Constructing...");
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    //TODO: Does this handle all proper error conditions?
    upgrade: function(creep) {
        if (creep.carry.energy == 0) {
            return u.status(true, this.STATUS_NOENERGY, "This creep has no more energy capacity left to upgrade.");
        }

        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
            return u.status(true, this.STATUS_ONTHEWAY, "On the way to the controller.");
        } else {
            return u.status(true, this.STATUS_PERFORMEDACTION, "Upgrading controller...");
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    withdraw: function(creep) {

        if (creep.carry.energy == creep.carryCapacity) {
            return u.status(true, this.STATUS_FULLENERGY, "This creep is full of energy, and can no longer withdraw.");
        }

        var nonEmptyContainers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] > 0);
            }
        });

        if (nonEmptyContainers.length > 0) {
            var closestContainer = creep.pos.findClosestByPath(nonEmptyContainers);
            if (!closestContainer) {
                return u.status(false, this.STATUS_NOPATH, "Containers exist, but none are reachable (all are blocked)"); //TODO: Check that this is handled everywhere.
            }
            if (closestContainer.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(closestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestContainer);
                    return u.status(true, this.STATUS_ONTHEWAY, "On the way to closest container to withdraw.");
                } else {
                    return u.status(true, this.STATUS_PERFORMEDACTION, "Withdrew from nearest container");
                }
            } else {
                return u.status(false, this.STATUS_NOTHINGTOWITHDRAW, "This shouldn't occur. Searched for nonEmptyContainers, and found a container with no energy.");
            }
        } else {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "There are no non-empty containers or storage in this room apparently.");
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    //TODO: might be dangerous source of dropped energy was killed.
    forage: function(creep) {

        if (creep.carry.energy == creep.carryCapacity) {
            return u.status(true, this.STATUS_FULLENERGY, "This creep is full of energy, and can no longer pick up.");
        }

        var droppedEnergies = creep.room.find(FIND_DROPPED_ENERGY);
        if (droppedEnergies.length == 0) {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "Could not find any dropped energies");
        }

        var closestDroppedEnergy = creep.pos.findClosestByPath(droppedEnergies);
        if (closestDroppedEnergy == null) {
            return u.status(false, this.STATUS_NOPATH);
        }

        if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestDroppedEnergy);
            return u.status(true, this.STATUS_ONTHEWAY, "Moving to dropped energy (TODO: Where and how much)");
        } else {
            return u.status(true, this.STATUS_PERFORMINGACTION, "Picking up dropped energy");
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },



    repair: function(creep) {
        if (creep.carry.energy == 0) {
            return u.status(true, this.STATUS_NOENERGY, "This creep has no more energy left to repair.");
        }

        var validTargets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (((structure.structureType == STRUCTURE_ROAD ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ||
                        structure.structureType == STRUCTURE_CONTAINER) &&
                    structure.hits < structure.hitsMax) || (structure.structureType == STRUCTURE_WALL && structure.hits < u.MAX_WALL_REPAIR));
            }
        });

        if (validTargets.length == 0) {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "Could not find object that needed repairing.");
        }

        var targetRepairable = creep.pos.findClosestByPath(validTargets);
        if (targetRepairable == null) {
            return u.status(false, this.STATUS_NOPATH, "One or more things need repairing, but no path to reach them.");
        }
        if (creep.carry.energy == 0) {
            return u.status(false, this.STATUS_NOENERGY, "One or more repairable objects exists and are reachable, but this creep has 0 energy.");
        }

        if (creep.repair(targetRepairable) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetRepairable);
            return u.status(true, this.STATUS_ONTHEWAY, "Moving to be in range of repairable " + targetRepairable.structureType + " at " + targetRepairable.pos.x + "," + targetRepairable.pos.y + "with hits " + targetRepairable.hits + "/" + targetRepairable.hitsMax);
        } else {
            return u.status(true, this.STATUS_PERFORMEDACTION, "Repaired " + targetRepairable.structureType + " at " + targetRepairable.pos.x + "," + targetRepairable.pos.y + " to " + targetRepairable.hits + "/" + targetRepairable.hitsMax);
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    move_to_flag: function(creep, flagName) {
        var destinationFlags = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return flag.name.includes(flagName);
            }
        });

        if (destinationFlags.length == 0) {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "Apparently no " + flagName + "flags in this room.");
        }
        var destinationFlag = creep.pos.findClosestByPath(destinationFlags);

        if (destinationFlag == null) {
            return u.status(false, this.STATUS_NOPATH, "Can't find a destination flag I can reach.");
        }

        var rangeToDestinationFlag = creep.pos.getRangeTo(destinationFlag);
        if (rangeToDestinationFlag > 0) {
            creep.moveTo(destinationFlag);
            return u.status(true, this.STATUS_ONTHEWAY, "On way to destination at " + destinationFlag.pos.x + "," + destinationFlag.pos.y);
        } else {
            creep.moveTo(destinationFlag);
            return u.status(true, this.STATUS_ONTHEWAY, "Arrived at " + flagName + " flag at " + destinationFlag.pos.x + "," + destinationFlag.pos.y);
        }

        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    ACCEPTABLE_PICKUP_DROPOFF_DIFFERENCE: 400,
    MAX_PERCENT_CAPACITY_BEFORE_STORING: .66,
    WAIT_THIS_CLOSE_TO_PICKUP: 4,
    ACCEPTABLE_DROPOFF_EMPTINESS: .4,
    ACCEPTABLE_TOWER_SPACE_REMAINING: 200,

    pickup: function(creep) {
        //console.log(creep.name + ": pickuping now");
        if (creep.carry.energy == creep.carryCapacity) {
            return u.status(true, this.STATUS_FULLENERGY, "This creep is full of energy, and can no longer pickup.");
        }

        var lowest = u.getLowestDropoffContainer(creep);
        var fullest = u.getFullestPickupContainer(creep);

        if (!fullest) {
            return u.status(false, this.STATUS_NOVALIDTARGETS, "No pickup containers could be found (could be no flags, or no containers)");
        }

        //determine whether to actually pick up or just hang out.

        var actuallyWithdraw = false;
        var withdrawReason;

        var nonFullExtensionsOrSpawns = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
            }
        });

        var nonFullTowers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER) && structure.energy < (structure.energyCapacity - this.ACCEPTABLE_TOWER_SPACE_REMAINING); //TODO: This will be weird if carry capacity is more than what tower can hold
            }
        });

        if (nonFullExtensionsOrSpawns.length > 0) {
            //keeping spawns full is priority #1
            actuallyWithdraw = true;
            withdrawReason = "Withdrawing to fill extension or spawn";
        } else if (nonFullTowers.length > 0) {
            actuallyWithdraw = true;
            targetDropoff = creep.pos.findClosestByPath(nonFullTowers);
            dropoffReason = "Withdrawing to fill tower";
        } else if (u.dropoffNeedsEnergy(lowest, fullest)) {
            //keeping dropoffs full enough is priority #2
            actuallyWithdraw = true;
            withdrawReason = "Withdrawing because a dropoff isn't full enough.";
        } else if (u.pickupTooFull(fullest, this.MAX_PERCENT_CAPACITY_BEFORE_STORING, this.ACCEPTABLE_PICKUP_DROPOFF_DIFFERENCE, this.ACCEPTABLE_DROPOFF_EMPTINESS)) {
            //keeping pickups unclogged, and storing in storage to do so, is priority #3
            actuallyWithdraw = true;
            withdrawReason = "Withdrawing because pickup is too full, need to make room (and fill in long term storage)";
        } else {
            //TODO: Add a dropoff too full condition, where if it's >90% full we pull from it or something.
        }

        //  console.log(creep.name + ": actually withdraw?:" + actuallyWithdraw);
        //  console.log(creep.name + ":  withdrawReason:" + withdrawReason);

        //go to pickup and maybe actually pickup
        var storage = u.getStorage();
        if (fullest.store[RESOURCE_ENERGY] == 0 && storage && storage.store[RESOURCE_ENERGY] > 0) {
            //time to pull on our reserves to jumpstart us.
            fullest = storage;
            console.log("Pulling on emergency funds in storage.");
        }

        if (creep.pos.getRangeTo(fullest) > this.WAIT_THIS_CLOSE_TO_PICKUP) {
            creep.moveTo(fullest);
            if (actuallyWithdraw) {
                return u.status(true, this.STATUS_ONTHEWAY, "Moving to fullest pickup container, with intent to withdraw");
            } else {
                return u.status(true, this.STATUS_ONTHEWAY, "Moving to fullest pickup container,  just to hang out for now.");
            }
        } else {
            if (actuallyWithdraw) {
                var withdraw_status = creep.withdraw(fullest, RESOURCE_ENERGY);
                if (withdraw_status == ERR_NOT_IN_RANGE) { //TODO: Don't withdraw all.
                    creep.moveTo(fullest);
                    return u.status(true, this.STATUS_ONTHEWAY, "Moving to withdraw: Intent is " + withdrawReason);
                } else {
                    return u.status(true, this.STATUS_PERFORMEDACTION, "Withdrawing. Intent is " + withdrawReason);
                }
            }
            return u.status(false, this.STATUS_NOVALIDTARGETS, "Waiting for a destination to open up");
        }
        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    },

    dropoff: function(creep) {
        //  console.log(creep.name + ": Dropoff begins");
        if (creep.carry.energy == 0) {
            return u.status(true, this.STATUS_NOENERGY, "This creep has no energy, and can no longer drop off. [NORMAL]");
        }

        var lowest = u.getLowestDropoffContainer(creep);
        var fullest = u.getFullestPickupContainer(creep);

        //figure out where to go

        var targetDropoff;
        var dropoffReason;

        var nonFullExtensionsOrSpawns = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
            }
        });

        var nonFullTowers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER) && structure.energy < (structure.energyCapacity - creep.carryCapacity); //TODO: This will be weird if carry capacity is more than what tower can hold
            }
        });
        //  console.log(creep.name + ": Reaching evaluation of dropoff target");

        if (nonFullExtensionsOrSpawns.length > 0) {
            //keeping spawns full is priority #1
            targetDropoff = creep.pos.findClosestByPath(nonFullExtensionsOrSpawns);
            dropoffReason = "Dropoffing to fill extension or spawn";
            //    console.log(creep.name + ": Finished seeing that spawns are right targets");
        } else if (nonFullTowers.length > 0) {
            targetDropoff = creep.pos.findClosestByPath(nonFullTowers);
            dropoffReason = "Dropoffing to fill tower";
        } else if (u.dropoffNeedsEnergy(lowest, fullest)) {
            //keeping dropoffs full enough is priority #2
            targetDropoff = lowest;
            dropoffReason = "Dropoffing because a dropoff isn't full enough.";
            //  console.log(creep.name + ": Finished seeing that a dropoff needs energy");
        } else if (u.pickupTooFull(fullest, this.MAX_PERCENT_CAPACITY_BEFORE_STORING, this.ACCEPTABLE_PICKUP_DROPOFF_DIFFERENCE, this.ACCEPTABLE_DROPOFF_EMPTINESS)) {
            if (u.lowestHasRoom(lowest)) {
                targetDropoff = lowest;
                dropoffReason = "Dropoffing because pickup is too full, need to make room (and fill in long term storage)";
                //  console.log(creep.name + ": Finished seeing that pickup is too full");
            } else {
                //see if there's storage in the room.
                var storage = u.getStorage(creep.room);
                if (storage) {
                    //store it!
                    dropoffReason = "Dropoffing because I just have some remaining energy, and will drop it in storage.";
                    targetDropoff = storage; //TODO: Does this need to be handled differently later?
                    //  console.log(creep.name + ": Finished seeing that storage is needed");
                } else {
                    //THERE'S NO WAY OR NO NEED TO DROPOFF.
                    return u.status(false, this.STATUS_NOVALIDTARGETS, "Conditions are not right (in one of a million ways) to dropoff energy anywhere.");
                    //    console.log(creep.name + ": Finished seeing that nothing is right for dropoff");
                }
            }


        }
        //go there and dropoff

        //console.log("Dropoff target is " + targetDropoff);
        //console.log(creep.name + "Reaching point where we try to transfer");
        var transfer_result = creep.transfer(targetDropoff, RESOURCE_ENERGY);

        if (transfer_result == ERR_NOT_IN_RANGE) {
            var moveResult = creep.moveTo(targetDropoff);
            return u.status(true, this.STATUS_ONTHEWAY, "Moving to dropoff: " + dropoffReason);
        } else if (transfer_result == ERR_INVALID_TARGET) {
            return u.status(true, this.STATUS_ONTHEWAY, "Moving to dropoff: " + dropoffReason); //TODO: This is jank.
        } else {
            return u.status(true, this.STATUS_PERFORMEDACTION, "Actually dropoffing: " + dropoffReason);
        }

        //  console.log(creep.name + "Reaching end of method");
        return u.status(false, this.STATUS_UNKNOWN_PROBLEM, "Reached end of method without returning a status.");
    }


}

module.exports = behaviors;
