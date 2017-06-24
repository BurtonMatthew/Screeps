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
        
        
        if(dropped)
        {
            if(creep.pickup(dropped) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(dropped);
            }
        }
        else if(creep.room.storage !== undefined && creep.room.storage.store[RESOURCE_ENERGY] > 0)
        {
            if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY, 
                Math.min(creep.carryCapacity - creep.carry.energy, creep.room.storage.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(creep.room.storage);
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
    },
    
    getClosestSpawner: function(pos)
    {
        const closest = pos.findClosestByRange(FIND_MY_STRUCTURES, {ignoreCreeps: 1, filter: (struct) => struct.structureType == STRUCTURE_SPAWN});
        if(closest)
            return closest;
        else
            return { createCreep: function(body,name,mem) { } }; //No avail spawner, but return spawn function so we can avoid null checks
    },
    
    getAvailableSpawner: function(room)
    {
        const availSpawners = room.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_SPAWN && struct.spawning === null} );
        if(availSpawners.length > 0)
            return availSpawners[0];
        else
            return { createCreep: function(body,name,mem) { } }; //No avail spawner, but return spawn function so we can avoid null checks
    },
    
    spawnToCount: function(getSpawnerFunc, count, body, name, mem)
    {
        for(var i=0; i<count; ++i)
        {
            if(Game.creeps[name + i] === undefined)
            {
                getSpawnerFunc().createCreep(body, name+i, mem);
                return true;
            }
        }
        return false;
    },
    
    spawnStrategyArray: function(stratFunc, arr)
    {
        for(var i=0, len=arr.length; i<len; ++i)
        {
            if(stratFunc(arr[i]))
                return true;
        }
        return false;
    }
};

module.exports = utils;