var u = require("u");
var behaviors = require('behaviors');
var notifications = require('notifications');

var roleMiner = {

    INITIAL_BEHAVIOR: behaviors.HARVESTING,

    /** @param {Creep} creep **/
    run: function(creep) {
        var status;
        if (creep.memory.behavior == behaviors.HARVESTING) {
            status = behaviors.harvest(creep, {"stick_to_empty" : true});
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_FULLENERGY:
                    creep.memory.behavior = behaviors.TRANSFERRING_TO_NEAREST_CONTAINER;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.WAITING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.WAITING;
                    break;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.PERFORMEDACTION:
                    break;
                default:
                    break;
            }
        } else if (creep.memory.behavior == behaviors.TRANSFERRING_TO_NEAREST_CONTAINER) {
            status = behaviors.transferToNearestContainer(creep);
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_NOENERGY:
                    creep.memory.behavior = behaviors.HARVESTING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.TRANFERRING_TO_NEAREST_SPAWN;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.TRANSFERRING_TO_NEAREST_SPAWN;
                    break;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.PERFORMEDACTION:
                    break;
                default:
                    break;
            }
        } else if (creep.memory.behavior == behaviors.TRANSFERRING_TO_NEAREST_SPAWN) {
            status = behaviors.transferToNearestSpawn(creep);
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_NOENERGY:
                    creep.memory.behavior = behaviors.HARVESTING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.WAITING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.WAITING;
                    break;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.PERFORMEDACTION:
                    break;
                default:
                    break;
            }
        } else if (creep.memory.behavior == behaviors.WAITING) {

            while (true) {
                creep.memory.behavior = behaviors.HARVESTING;
                status = behaviors.harvest(creep);
                notifications.notify(creep, status);
                if (status["succeeded"]) {
                    break;
                }

                creep.memory.behavior = behaviors.TRANSFERRING_TO_NEAREST_SPAWN;
                status = behaviors.transferToNearestSpawn(creep);
                notifications.notify(creep, status);
                if (status["succeeded"]) {
                    break;
                }

                creep.memory.behavior = behaviors.TRANSFERRING_TO_NEAREST_CONTAINER;
                status = behaviors.transferToNearestSpawn(creep);
                notifications.notify(creep, status);
                if (status["succeeded"]) {
                    break;
                }

                creep.memory.behavior = behaviors.WAITING;
                status = behaviors.wait(creep);
                notifications.notify(creep, status);

                break;
            }
        } else {
            //  console.log("Miner is not in a known behavior: " + creep.memory.behavior);

            creep.memory.behavior = this.INITIAL_BEHAVIOR;
        }

        return status;
    }
};

module.exports = roleMiner;
