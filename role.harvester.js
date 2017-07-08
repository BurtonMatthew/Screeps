var utils = require('utils');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.full)
        {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });
            
            if(!target)
            {
                var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });
            }
            
            if(!target && creep.room.storage !== undefined && creep.room.storage.store[RESOURCE_ENERGY] < creep.room.storage.storeCapacity)
            {
                target = creep.room.storage;
            }
            
            if(target) 
            {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target, {range: 1});
                }
            }
            
            if(creep.carry.energy == 0)
            {
                creep.memory.full = false;
            }
        }
        else
        {
            /*
            if(creep.carry.energy < creep.carryCapacity) 
            {
                var sourceToMine = creep.pos.findClosestByRange(FIND_SOURCES, {
                    filter: (source) => {
                        return source.energy > 0;
                    }
                });
                if(sourceToMine)
                {
                    if(creep.harvest(sourceToMine) == ERR_NOT_IN_RANGE) 
                    {
                        creep.moveTo(sourceToMine);
                    }
                }
            }
            else
            {
                creep.memory.full = true;
            }
            */
            creep.memory.full = utils.fillEnergy(creep);
        }
	}
};

module.exports = roleHarvester;