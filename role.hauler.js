var utils = require('utils');

var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(utils.checkSwaps(creep)) {}
        else if(creep.memory.full)
        {
            if(creep.memory.home !== undefined && creep.room.name !== creep.memory.home)
            {
                utils.navToRoom(creep, creep.memory.home);
                //creep.moveTo(Game.rooms[creep.memory.home].storage);
            }
            else
            {
                var target = false;
                if(creep.memory.resourceType == RESOURCE_ENERGY)
                {
                    target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                return (/*structure.structureType == STRUCTURE_LINK || */
                                        structure.structureType == STRUCTURE_EXTENSION ||
                                        structure.structureType == STRUCTURE_SPAWN ||
                                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                            }
                    });
                }
                
                const spawner = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_SPAWN });
                
                if(!target && creep.room.storage !== undefined && _.sum(creep.room.storage.store) < creep.room.storage.storeCapacity)
                {
                    target = creep.room.storage;
                }
                
                if(target) 
                {
                    if(creep.transfer(target, creep.memory.resourceType) == ERR_NOT_IN_RANGE) 
                    {
                        creep.moveTo(target, {reusePath: 10});
                    }
                }
                else if(spawner && creep.pos.isNearTo(spawner))
                {
                    creep.drop(creep.memory.resourceType);
                }
                else if(spawner)
                {
                    creep.moveTo(spawner, {reusePath: 10});
                }
                
                if(_.sum(creep.carry) == 0)
                {
                    creep.memory.full = false;
                }
            }
        }
        else
        {
            const container = Game.getObjectById(creep.memory.containerId);
            if(!creep.pos.isNearTo(container))
            {
                creep.moveTo(container);
            }
            else if(container.store[creep.memory.resourceType] > creep.carryCapacity - creep.carry[creep.memory.resourceType])
            {
                creep.withdraw(container, creep.memory.resourceType);
            }
            
            if(creep.carryCapacity == _.sum(creep.carry))
            {
                creep.memory.full = true;
            }
        }
	}
};

module.exports = roleHauler;