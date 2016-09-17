var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleFerrier = require('role.ferrier');
var roleMiner = require("role.miner");

var behaviors = require("behaviors");
var notifications = require("notifications");

var bodies = require("bodies");

var goals = require("goals");

var u = require("u");

Memory.hivemind = {};

var hivemind = {
    think: function(rooms) {
        console.log("++++HIVEMIND++++");
        for (var roomKey in rooms) {
            var room = rooms[roomKey];
            var controller = room.controller;

            if (this._getGoal() == null) {
                if (controller.level == 0) {
                  console.log("DONT HAVE LEVEL 0 HANDLED YET DOH!");
                } else if (controller.level == 1) {
                    this._setGoal("level1_buildUpWorkers");
                } else if (controller.level == 2) {
                    this._setGoal("level2_buildExtensions");
                } else if (controller.level == 6) {
                    this._setGoal("level6_upgradeTo7");
                }
            }

            var goal = this._getGoal();
            console.log("CURRENT GOAL IS: "+ goal);
            var goalFunction = goals[goal];
            if (goalFunction) {
                var status = goals[goal].call(goals, room);
                console.log("STOOTUS: " + status.keys);
                if (status) {
                console.log("CURRENT GOAL: " + status.goal + "\tSTATUS: " + status.status + "\tPROGRESS: " + status.percent + "%" + "\tMESSAGE: " + status.message);
              } else {
                console.log("WARNING: No status returned from goal: " + goal + ". Check up on it.")
              }
            } else {
                console.log("!!!! HUMAN INTERVENTION NEEDED: Goal " + goal + " does not map to a known executable goal. Setting goal to null");
                this._setGoal(null);
            }

            if (status && status.succeeded) {
                if (goal == "level1_buildUpWorkers") {
                    this._setGoal("level1_upgradeTo2");
                } else if (goal == "level1_upgradeTo2") {
                    this._setGoal("level1_buildRoadsToSource");
                } else if (goal == "level1_buildRoadsToSource") {
                  console.log("FOOF");
                  this._setGoal("level1_buildExtensions");
                } else {
                    console.log("!!!! HUMAN INTERVENTION NEEDED: No known next goal. Need human to define it.");
                }
            }
        }

        notifications.forget();
        notifications.showStatus();
        console.log("++++++++++++++++");
    },

    _setGoal: function(goal) {
        console.log("Setting goal as " + goal);
        Memory.hivemindgoal = goal;
    },

    _getGoal: function() {
        return Memory.hivemindgoal;
    },


}

if (!hivemind._getGoal()) {
    hivemind._setGoal(hivemind.goal0P0);
}

module.exports = hivemind;
