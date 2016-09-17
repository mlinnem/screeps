var behaviors = require('behaviors');
var u = require("u");
var notifications = require('notifications');


var roleFerrier = {

    INITIAL_BEHAVIOR: behaviors.PICKUPING,

    /** @param {Creep} creep **/
    run: function(creep) {
        var status;
        var tries = behaviors.MAX_TRIES;
        if (creep.memory.behavior == behaviors.PICKUPING) {
            status = behaviors.pickup(creep);
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_FULLENERGY:
                    creep.memory.behavior = behaviors.DROPOFFING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.PICKUPING;
                    break;
                    break;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.PERFORMEDACTION:
                    break;
                default:
                    break;
                    //TODO: Need to have and handle NOPATH
            }
        } else if (creep.memory.behavior == behaviors.DROPOFFING) {
            status = behaviors.dropoff(creep);
            notifications.notify(creep, status);
            switch (status["result"]) {
                case behaviors.STATUS_NOENERGY:
                    creep.memory.behavior = behaviors.PICKUPING;
                    break;
                case behaviors.STATUS_NOVALIDTARGETS:
                    creep.memory.behavior = behaviors.PICKUPING;
                    break;
                case behaviors.STATUS_ONTHEWAY:
                    break;
                case behaviors.PERFORMEDACTION:
                    break;
                default:
                    break;
                    //TODO: Need to have and handle NOPATH
            }
        } else {
            console.log("Ferrier is not in a known behavior:" + creep.memory.behavior);

            creep.memory.behavior = this.INITIAL_BEHAVIOR;
        }

        return status;
    }
};

module.exports = roleFerrier;
