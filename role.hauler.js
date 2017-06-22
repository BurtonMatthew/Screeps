var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.full)
        {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });
            
            const spawner = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_SPAWN });
            
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
            }
            else if(spawner && creep.pos.isNearTo(spawner))
            {
                creep.drop(RESOURCE_ENERGY);
            }
            else if(spawner)
            {
                creep.moveTo(spawner);
            }
            
            if(creep.carry.energy == 0)
            {
                creep.memory.full = false;
            }
        }
        else
        {
            const container = Game.getObjectById(creep.memory.containerId);
            if(creep.withdraw(container, RESOURCE_ENERGY, 
                Math.min(creep.carryCapacity - creep.carry.energy, container.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(container);
            }
            
            if(creep.carryCapacity == creep.carry.energy)
            {
                creep.memory.full = true;
            }
        }
	}
};

module.exports = roleHauler;