let utils = require('utils');

let priorityList =
{
    STRUCTURE_TOWER: 0,
    STRUCTURE_CONTAINER: 1,
    STRUCTURE_LINK: 1,
    STRUCTURE_SPAWN: 2,
    STRUCTURE_STORAGE: 2,
    STRUCTURE_EXTENSION: 3,
    STRUCTURE_EXTRACTOR: 3,
    STRUCTURE_ROAD: 4,
    STRUCTURE_WALL: 5,
    STRUCTURE_RAMPART: 5,
    STRUCTURE_KEEPER_LAIR: 9,
    STRUCTURE_PORTAL: 9,
    STRUCTURE_CONTROLLER: 9,
    STRUCTURE_OBSERVER: 9,
    STRUCTURE_POWER_BANK: 9,
    STRUCTURE_POWER_SPAWN: 9,
    STRUCTURE_LAB: 9,
    STRUCTURE_TERMINAL: 9,
    STRUCTURE_NUKER: 9
};
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(!creep.memory.full)
        {
            creep.memory.full = utils.fillEnergy(creep);
        }
        else if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
        }
        else
        {
            var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            if(targets.length) {
                var target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {filter: (struct) => struct.structureType == STRUCTURE_SPAWN});
                if(!target)
                    target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {filter: (struct) => struct.structureType == STRUCTURE_TOWER});
                if(!target)
                    target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {filter: (struct) => struct.structureType == STRUCTURE_EXTENSION});
                if(!target)
                    target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if(creep.build(target) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target);
                }
            }
            else
            {
                creep.suicide();
            }
            
            if(creep.carry.energy == 0)
            {
                creep.memory.full = false;
            }
        }
	}
};

module.exports = roleBuilder;