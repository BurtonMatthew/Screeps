var utils = require('utils');

var roleRefiller = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(utils.checkSwaps(creep)) {}
        else if(creep.memory.full)
        {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION 
                                || structure.structureType == STRUCTURE_SPAWN 
                                || structure.structureType == STRUCTURE_TOWER
                                || structure.structureType == STRUCTURE_LAB) && structure.energy < structure.energyCapacity;
                    }
            });
            
            if(!target && creep.room.storage !== undefined && creep.room.storage.store[RESOURCE_ENERGY] < creep.room.storage.storeCapacity)
            {
                target = creep.room.storage;
            }
            
            if(target) 
            {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target);
                }
                
                if(creep.room.storage !== undefined && target != creep.room.storage)
                {
                    creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
                }
            }
            
            if(creep.carry.energy == 0)
            {
                creep.memory.full = false;
            }
        }
        else
        {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });
            
            if(target)
                creep.memory.full = utils.fillEnergy(creep);
        }
	}
};

module.exports = roleRefiller;