var utils = require('utils');
var roleFighter =
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        if(targets.length === 0)
            targets = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (s)=> s.structureType != STRUCTURE_CONTROLLER && s.structureType != STRUCTURE_POWER_BANK });
        if(targets.length === 0)
            targets = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES, {filter: (s) => s.progress > 0});
        
        if(utils.checkSwaps(creep)) {}
        else if(!(creep.room.controller && !creep.room.controller.my && creep.room.controller.safeMode ) && targets.length > 0) 
        {
            if(creep.attack(targets[0]) !== OK) 
            {
                creep.rangedAttack(targets[0]);
                if(creep.hits < creep.hitsMax)
                    creep.heal(creep);
            }
            creep.moveTo(targets[0]);
        }
        else if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
            if(creep.hits < creep.hitsMax)
                creep.heal(creep);
        }
        else if(creep.hits < creep.hitsMax)
        {
            creep.heal(creep);
        }
    }
};

module.exports = roleFighter;