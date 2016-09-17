var behaviors = require('behaviors');
var u = require("u");
var notifications = require('notifications');

var roleUpgrader = {

    INITIAL_BEHAVIOR: behaviors.WITHDRAWING,

    /** @param {Creep} creep **/
    run: function(creep) {
        var status;
        if (creep.memory.behavior == behaviors.UPGRADING) {
            status = behaviors.upgrade(creep);
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
                    creep.memory.behavior = behaviors.UPGRADING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.HARVESTING;
                    break;
                case behaviors.STATUS_NOTHINGTOWITHDRAW:
                    creep.memory.behavior = behaviors.HARVESTING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.HARVESTING;
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
                    creep.memory.behavior = behaviors.UPGRADING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.UPGRADING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.WAITING;
                    break;
                case behaviors.STATUS_NOT_ENOUGH_RESOURCES:
                    creep.memory.behavior = behaviors.UPGRADING;
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
                creep.memory.behavior = behaviors.UPGRADING;
                status = behaviors.upgrade(creep);
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

module.exports = roleUpgrader;
