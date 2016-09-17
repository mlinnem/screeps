var bodies = {
    //TODO: Refactor these first two back to lvl1
    lvl0_shorthaul: [WORK, CARRY, MOVE],
    lvl0_longhaul: [WORK, CARRY, MOVE, MOVE],
    lvl2_shorthaul: [WORK, WORK, WORK, CARRY, MOVE, MOVE],
    lvl2_longhaul: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    lvl2_repairer: [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    lvl3_nohaul: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
    lvl3_nohaulwalkish: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
    lvl3_nohaulwalker: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE],
    lvl3_nohaulwalkermini: [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE],
    lvl3_allhaul: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    lvl3_constructer: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    lvl3_constructer_carry: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    lvl3_repairer: [WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
    lvl3_repairer_worky: [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
    lvl5_ranged_grunt: [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
};

module.exports = bodies;
