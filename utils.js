var mapM = require('map.memory');
var utils =
{
    navToRoom: function(creep, targetRoom)
    {
        const route = Game.map.findRoute(creep.room, targetRoom, {
        routeCallback(roomName, fromRoomName) {
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
    },
    
    getClosestSpawner: function(pos)
    {
        var closest = pos.findClosestByPath(FIND_MY_STRUCTURES, {ignoreCreeps: 1, filter: (struct) => struct.structureType == STRUCTURE_SPAWN});
        if(!closest)
            closest = pos.findClosestByRange(FIND_MY_STRUCTURES, {ignoreCreeps: 1, filter: (struct) => struct.structureType == STRUCTURE_SPAWN});
            
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
    },
    
    moveTo: function(creep, dest, opts)
    {
        if(creep.memory._myMove === undefined)
        {                           // destination, path, currentIndex, curX, curY, stuck timer
            creep.memory._myMove = { d: {x:-1,y:-1}, p:"",i:0,x:-1,y:-1,s:0 };
        }
        
        const cache = creep.memory._myMove;
        if(dest.x != cache.d.x || dest.y != cache.d.y || Math.random() < 0.01)
        {
            const pathInfo = PathFinder.search(creep.pos, {pos: dest, range: ("range" in opts ? opts.range : 0)}, 
            {
                maxRooms:1,
                plainCost:2,
                swampCost:10,
                roomCallback: function(roomName)
                {
                    
                    let room = Game.rooms[roomName];
                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;
                    // TODO CACHE THESE IN MEMORY, SHOULD ONLY NEED TO BE BUILT RARELY
                    room.find(FIND_STRUCTURES).forEach(
                        function(struct) 
                        {
                            if (struct.structureType === STRUCTURE_ROAD) 
                            {
                                // Favor roads over plain tiles
                                costs.set(struct.pos.x, struct.pos.y, 1);
                            } 
                            else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                    (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) 
                            {
                                // Can't walk through non-walkable buildings
                                costs.set(struct.pos.x, struct.pos.y, 0xff);
                            }
                        });
                
                    return costs;
                }
            });
            
            var pathDirs = new Array(pathInfo.path.length);
            var prevPos = creep.pos;
            var curPos = creep.pos;
            for(var i=0, len=pathInfo.path.length; i<len; ++i)
            {
                curPos = pathInfo.path[i];
                var xDif = curPos.x - prevPos.x;
                var yDif = curPos.y - prevPos.y;
                if(yDif === -1 && xDif === 0)
                    pathDirs[i] = TOP;
                else if(yDif === -1 && xDif === 1)
                    pathDirs[i] = TOP_RIGHT;
                else if(yDif === 0 && xDif === 1)
                    pathDirs[i] = RIGHT;
                else if(yDif === 1 && xDif === 1)
                    pathDirs[i] = BOTTOM_RIGHT;
                else if(yDif === 1 && xDif === 0)
                    pathDirs[i] = BOTTOM;
                else if(yDif === 1 && xDif === -1)
                    pathDirs[i] = BOTTOM_LEFT;
                else if(yDif === 0 && xDif === -1)
                    pathDirs[i] = LEFT;
                else if(yDif === -1 && xDif === -1)
                    pathDirs[i] = TOP_LEFT;
                    
                prevPos = curPos;
            }
            creep.memory._myMove.p = pathDirs;
            creep.memory._myMove.i = 0;
            creep.memory._myMove.d = dest;
            creep.memory._myMove.x = creep.x;
            creep.memory._myMove.y = creep.y;
            creep.memory._myMove.s = 0;
        }
        
        
        if(creep.memory._myMove.x !== creep.x || creep.memory._myMove.y !== creep.y)
        {
            creep.memory._myMove.x = creep.x
            creep.memory._myMove.y = creep.y;
            ++creep.memory._myMove.i;
            creep.memory._myMove.s = 0;
        }
        else if(creep.fatigue === 0)
        {
            ++creep.memory._myMove.s;
        }
        
        creep.move(creep.memory._myMove.p[creep.memory._myMove.i]);
    }
};

module.exports = utils;