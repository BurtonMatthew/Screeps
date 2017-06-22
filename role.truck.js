var utils = require('utils');
var roleTruck = {

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
            const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_CONTAINER && struct.store[RESOURCE_ENERGY] < struct.storeCapacity});
            var target = false;
            if(!target && "storage" in creep.room && creep.room.storage.store[RESOURCE_ENERGY] < creep.room.storage.storeCapacity)
            {
                target = creep.room.storage;
            }
            
            if(!target && container)
            {
                target = container;
            }
            
            if(target) 
            {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target);
                }
            }
            else
            {
                 creep.moveTo(creep.room.controller);
                 if(creep.pos.x > 4 && creep.pos.y > 4 && creep.pos.x < 46 && creep.pos.y < 46)
                 {
                     creep.drop(RESOURCE_ENERGY);
                 }
            }
            
            if(creep.carry.energy == 0)
            {
                creep.suicide();
            }
        }
	}
};

module.exports = roleTruck;