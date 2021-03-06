var behaviors = require('behaviors');
var u = require("u");
var notifications = require('notifications');

var roleRepairer = {

    INITIAL_BEHAVIOR : behaviors.FORAGING,

    /** @param {Creep} creep **/
    run: function(creep) {
        var status;
        if (creep.memory.behavior == behaviors.HARVESTING) {
            status = behaviors.harvest(creep);
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_FULLENERGY:
                    creep.memory.behavior = behaviors.REPAIRING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.REPAIRING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.WAITING;
                    break;
                case behaviors.STATUS_NOT_ENOUGH_RESOURCES:
                    creep.memory.behavior = behaviors.REPAIRING;
                    break;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.PERFORMEDACTION:
                    break;
                default:
                    break;
            }
        } else if (creep.memory.behavior == behaviors.REPAIRING) {
            status = behaviors.repair(creep);
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_NOENERGY:
                    creep.memory.behavior = behaviors.FORAGING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.FORAGING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.FORAGING;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.PERFORMEDACTION:
                    break;
                default:
                    break;
            }
        } else if (creep.memory.behavior == behaviors.FORAGING) {
            status = behaviors.forage(creep);
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_FULLENERGY:
                    creep.memory.behavior = behaviors.WAITING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.WITHDRAWING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.WITHDRAWING;
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
                    creep.memory.behavior = behaviors.REPAIRING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.WAITING;
                    break;
                case behaviors.STATUS_NOPATH:
                    creep.memory.behavior = behaviors.WAITING;
                    break;
                case behaviors.STATUS_NOTHINGTOWITHDRAW:
                    creep.memory.behavior = behaviors.HARVESTING;
                    break;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.STATUS_PERFORMEDACTION:
                    break;
                default:
                    console.log(creep.memory.role + " " + creep.name + " didn't catch result in withdrawing:" + status["result"]);
                    break;
            }
        } else if (creep.memory.behavior == behaviors.WAITING) {

            while (true) {
                creep.memory.behavior = behaviors.REPAIRING;
                status = behaviors.repair(creep);
                notifications.notify(creep, status);
                if (status["succeeded"]) {
                    break;
                }

                creep.memory.behavior = behaviors.FORAGING;
                status = behaviors.forage(creep);
                notifications.notify(creep, status);;
                if (status["succeeded"]) {
                  break;
                }

                creep.memory.behavior = behaviors.WITHDRAWING;
                status = behaviors.withdraw(creep);
                console.log("Withdrawing as repairer status:" + status);
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

                //TODO: Maybe add returning for more robustness later?
                creep.memory.behavior = behaviors.WAITING;
                status =  behaviors.wait(creep);

                break;
            }
        } else {
            console.log("Repairer is not in a known behavior.");
            console.log(creep.memory.behavior);

            creep.memory.behavior = this.INITIAL_BEHAVIOR;
        }
        return status;
    }
};

module.exports = roleRepairer;
