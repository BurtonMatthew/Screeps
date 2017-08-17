var utils = require('utils');

var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(utils.checkSwaps(creep)) {}
        else if(creep.memory.full)
        {
            if(creep.memory.home !== undefined && creep.room.name !== creep.memory.home)
            {
                //utils.navToRoom(creep, creep.memory.home);
                utils.moveTo(creep, Game.rooms[creep.memory.home].controller, {reusePath: 15, range:2});
            }
            else if(creep.memory.target)
            {
                var target = Game.getObjectById(creep.memory.target);
                if(!target 
                    || (target.energy !== undefined && target.energy === target.energyCapacity)
                    || (target.store !== undefined && _.sum(target.store) === target.storeCapacity))
                {
                    delete creep.memory.target;
                }
                else
                {
                    if(creep.transfer(target, creep.memory.resourceType) == ERR_NOT_IN_RANGE) 
                    {
                        creep.moveTo(target, {reusePath: 10, range:1});
                        //utils.moveTo(creep, target, {range:1});
                    }
                }

                if(_.sum(creep.carry) == 0)
                {
                    creep.memory.full = false;
                    delete creep.memory.target;
                }
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
                                        structure.structureType == STRUCTURE_TOWER /*||
                                        structure.structureType == STRUCTURE_STORAGE*/) && 
                                        ( (structure.energy !== undefined && structure.energy < structure.energyCapacity)
                                          || (structure.store !== undefined && _.sum(structure.store) < structure.storeCapacity) );
                            }
                    });
                        
                    if(!target)
                        target = creep.room.storage;

                    //if(target)
                    //    creep.memory.target = target.id;
                }
                else
                {                    
                    target = creep.room.storage;
                }
                
                const spawner = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_SPAWN });
                
                if(target) 
                {
                    if(creep.transfer(target, creep.memory.resourceType) == ERR_NOT_IN_RANGE) 
                    {
                        creep.moveTo(target, {reusePath: 10});
                        //utils.moveTo(creep, target, {range:1});
                    }
                }
                else if(spawner && creep.pos.isNearTo(spawner))
                {
                    creep.drop(creep.memory.resourceType);
                }
                else if(spawner)
                {
                    creep.moveTo(spawner, {reusePath: 10});
                    //utils.moveTo(creep, spawner, {range:1});
                    //creep.memory.target = spawner.id;
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
            if(!container)
                creep.suicide();
                
            if(!creep.pos.isNearTo(container))
            {
                creep.moveTo(container);
                //utils.moveTo(creep, container, {range:1});
            }
            else if(container.store[creep.memory.resourceType] > creep.carryCapacity - _.sum(creep.carry))
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