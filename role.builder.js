var utils = require('utils');
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
                var target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {filter: (struct) => struct.structureType == STRUCTURE_CONTAINER});
                if(!target)
                    target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {filter: (struct) => struct.structureType == STRUCTURE_TOWER});
                if(!target)
                    target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {filter: (struct) => struct.structureType == STRUCTURE_EXTENSION});
                if(!target)
                    target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
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