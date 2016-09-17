var u = require("u");
var behaviors = require('behaviors');
var notifications = require('notifications');

var roleBuilder = {

    INITIAL_BEHAVIOR: behaviors.WITHDRAWING,

    //TODO: Allow getting energy from containers and stuff as well as directly mining it.
    //TODO: Support picking up old dropped energy somehow.
    //TODO: Support reverting to repairing and stuff like that. More flexible behavior patterns.
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.behavior == behaviors.CONSTRUCTING) {
            status = behaviors.construct(creep);
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_NOENERGY:
                    creep.memory.behavior = behaviors.WITHDRAWING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.WAITING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.WAITING;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.PERFORMEDACTION:
                    break;
                default:
                    break;
            }
        } else if (creep.memory.behavior == behaviors.WITHDRAWING) {
            status = behaviors.withdraw(creep);
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_FULLENERGY:
                    creep.memory.behavior = behaviors.CONSTRUCTING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.HARVESTING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.HARVESTING;
                    break;
                case behaviors.STATUS_NOTHINGTOWITHDRAW:
                    creep.memory.behavior = behaviors.HARVESTING;
                    break;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.PERFORMEDACTION:
                    break;
                default:
                    break;
            }
        } else if (creep.memory.behavior == behaviors.HARVESTING) {
            status = behaviors.harvest(creep);
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_FULLENERGY:
                    creep.memory.behavior = behaviors.CONSTRUCTING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.CONSTRUCTING;
                    break;
                case behaviors.STATUS_NOT_ENOUGH_RESOURCES:
                    creep.memory.behavior = behaviors.CONSTRUCTING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.WAITING;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.PERFORMEDACTION:
                    break;
                default:
                    break;
            }
        } else if (creep.memory.behavior == behaviors.WAITING) {

            while (true) {
                creep.memory.behavior = behaviors.CONSTRUCTING;
                status = behaviors.construct(creep);
                notifications.notify(creep, status);
                if (status["succeeded"]) {
                    break;
                }

                creep.memory.behavior = behaviors.WITHDRAWING;
                status = behaviors.withdraw(creep);
                notifications.notify(creep, status);
                if (status["succeeded"]) {
                    break;
                }

                creep.memory.behavior = behaviors.HARVESTING;
                status = behaviors.harvest(creep);
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
            console.log("Builder is not in a known behavior.");
            console.log(creep.memory.behavior);

            creep.memory.behavior = this.INITIAL_BEHAVIOR;
        }

        return status;
    }
};

module.exports = roleBuilder;
