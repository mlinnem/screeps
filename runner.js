var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleFerrier = require('role.ferrier');
var roleMiner = require('role.miner');
var roleBlocker = require('role.blocker');
var roleWorker = require('role.worker');

var hivemind = require('hivemind');

var u = require("u");

var runner = {

    MAX_TRIES: 1,
    ROLENAMES_TO_ROLES: {}, //Allocated dynamically below.


    run: function(creep) {
        var tries = this.MAX_TRIES;
        var done = false;
        while (tries > 0 && done != true) {
            var roleToRun = this.ROLENAMES_TO_ROLES[creep.memory.role];

            if (! roleToRun) {
              console.log("Could not run role " + roleToRun + " of creep " + creep.name);
              return;
            }

            var status = this.ROLENAMES_TO_ROLES[creep.memory.role].run(creep);

            u.recordHistory(creep, status);

            if (status && status["succeeded"]) {
                done = true;
            } else {
                tries--;
            }
        }
    }
}

//runner.ROLENAMES_TO_ROLES[u.ROLE[WORKER] = roleWorker;
//runner.ROLENAMES_TO_ROLES[u.ROLE[MAINTAINER_WORKER] =  maintainerWorker;
//runner.ROLENAMES_TO_ROLES[u.ROLE[CONSTRUCTER] = roleConstructer;

//TODO: Has to be a better way than manually maintaining this

runner.ROLENAMES_TO_ROLES[u.ROLE.BUILDER] = roleBuilder;
runner.ROLENAMES_TO_ROLES[u.ROLE.FERRIER] = roleFerrier;
runner.ROLENAMES_TO_ROLES[u.ROLE.HARVESTER] = roleHarvester;
runner.ROLENAMES_TO_ROLES[u.ROLE.MINER] = roleMiner;
runner.ROLENAMES_TO_ROLES[u.ROLE.REPAIRER] = roleRepairer;
runner.ROLENAMES_TO_ROLES[u.ROLE.UPGRADER] = roleUpgrader;
runner.ROLENAMES_TO_ROLES[u.ROLE.BLOCKER] = roleBlocker;
runner.ROLENAMES_TO_ROLES[u.ROLE.WORKER] = roleWorker;

module.exports = runner;
