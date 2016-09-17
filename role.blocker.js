var u = require("u");
var behaviors = require('behaviors');
var notifications = require('notifications');

var roleBlocker = {

    INITIAL_BEHAVIOR: behaviors.MOVE_TO_FLAG,

    /** @param {Creep} creep **/
    run: function(creep) {
        console.log("Blocker's run method called");
        var status;

        if (creep.memory.behavior == behaviors.MOVE_TO_FLAG) {
            status = behaviors.move_to_flag(creep, "Blocker Move");
            notifications.notify(creep, status);
        } else {
          console.log("Builder is not in a known behavior.");
          console.log(creep.memory.behavior);

          creep.memory.behavior = this.INITIAL_BEHAVIOR;
        }
        
        rangedMassAttack();

        return status;
    },


};

module.exports = roleBlocker;
