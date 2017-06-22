var mapM = require('map.memory');
var utils =
{
    navToRoom: function(creep, targetRoom)
    {
        const route = Game.map.findRoute(creep.room, targetRoom, {
        routeCallback(roomName, fromRoomName) {
            if(roomName == "W5N1") { return 1; }
            if(mapM.isHostile(roomName)) { return Infinity; }
            return 1;
            }});
        
        if(route.length > 0) 
        {
            const exit = creep.pos.findClosestByRange(route[0].exit, {maxRooms: 1});
            const path = creep.pos.findPathTo(exit, {maxRooms: 1});
            creep.moveByPath(path);
        }
    },
    
    fillEnergy: function(creep)
    {
        const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: (rsc) => rsc.resourceType == RESOURCE_ENERGY && rsc.amount > 50 });
        const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_CONTAINER && struct.store[RESOURCE_ENERGY] > 50});
        
        
        if(creep.room.storage !== undefined && creep.room.storage.store[RESOURCE_ENERGY] > 0)
        {
            if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY, 
                Math.min(creep.carryCapacity - creep.carry.energy, creep.room.storage.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(creep.room.storage);
            }
        }
        else if(dropped)
        {
            if(creep.pickup(dropped) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(dropped);
            }
        }
        else if(container)
        {
            if(creep.withdraw(container, RESOURCE_ENERGY, 
                Math.min(creep.carryCapacity - creep.carry.energy, container.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(container);
            }
        }
        else //fallback to harvesting
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
        
        return creep.carry.energy == creep.carryCapacity;
    }
};

module.exports = utils;