var mapM = require('map.memory');
let bTree = require('behaviourTree');
var utils =
{
    /** @param {Creep} creep
     *  @param {String} targetRoom
     */
    navToRoom: function(creep, targetRoom)
    {
        if(!creep.memory.navExit || creep.room.name != creep.memory.navExit.roomName)
        {
            const route = Game.map.findRoute(creep.room, targetRoom, {
            routeCallback(roomName, fromRoomName) {
                if(mapM.isHostile(roomName)) { return Infinity; }
                return 1;
            }});

            if(route.length > 0) 
            {
                const exit = creep.pos.findClosestByRange(route[0].exit, {maxRooms: 1});
                creep.memory.navExit = exit.pos;
                creep.moveTo(exit, {reusePath: 15, maxRooms:1});
            }
        }
        else
        {
            creep.moveTo(new RoomPosition(creep.memory.navExit.x, creep.memory.navExit.y, creep.memory.navExit.roomName));
        }
        
        
    },
    
    /** @param {Creep} creep */
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
    
    /** @param {RoomPosition} room */
    getClosestSpawner: function(pos)
    {
        var closest = pos.findClosestByPath(FIND_MY_STRUCTURES, {ignoreCreeps: 1, filter: (struct) => struct.structureType == STRUCTURE_SPAWN});
        if(!closest)
            closest = pos.findClosestByRange(FIND_MY_STRUCTURES, {ignoreCreeps: 1, filter: (struct) => struct.structureType == STRUCTURE_SPAWN});
            
        if(closest)
            return closest;
        else
            return { createCreep: function(body,name,mem) { return ERR_BUSY; } }; //No avail spawner, but return spawn function so we can avoid null checks
    },
    
    /** @param {Room} room */
    getAvailableSpawner: function(room)
    {
        const availSpawners = room.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_SPAWN && struct.spawning === null} );
        if(availSpawners.length > 0)
            return availSpawners[0];
        else
            return { createCreep: function(body,name,mem) { return ERR_BUSY; } }; //No avail spawner, but return spawn function so we can avoid null checks
    },

    /** @param {String} roomName */
    getCrossmapSpawner: function(roomName)
    {
        const spawner = _(Game.rooms)
                            .filter(room => room.controller && room.controller.my)
                            .sortBy(room => Game.map.findRoute(room, roomName).length)
                            .map(room => room.find(FIND_MY_STRUCTURES, 
                                {filter: (struct) => struct.structureType == STRUCTURE_SPAWN && struct.spawning === null}))
                            .flatten()
                            .first();
        if(spawner)
            return spawner;
        else
            return { createCreep: function(body,name,mem) { return ERR_BUSY; } }; //No avail spawner, but return spawn function so we can avoid null checks
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
    
    moveTo: function(creep, dest, opts)
    {
        if(opts === undefined)
            opts = { range: 0 };
        if(dest.pos !== undefined)
            dest = dest.pos;
            
        if(creep.pos.x == dest.x && creep.pos.y == dest.y)
            return OK;
            
        if(creep.memory._myMove === undefined)
        {                           // destination, path, currentIndex, curX, curY, stuck timer
            creep.memory._myMove = { d: {x:-1,y:-1,roomName:""}, p:"",i:0,x:-1,y:-1,s:0 };
        }
        
        const cache = creep.memory._myMove;
        if(dest.x != cache.d.x || dest.y != cache.d.y ||  creep.memory._myMove.p.length == creep.memory._myMove.i ||  Math.random() < 0.01)
        {
            const pathInfo = PathFinder.search(creep.pos, {pos: dest, range: opts.range}, 
            {
                maxRooms:2,
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

                // Fix room boundary crossings
                if(xDif === 49) xDif = -1; else if(xDif === -49) xDif = 1;
                if(yDif === 49) yDif = -1; else if(yDif === -49) yDif = 1;

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
                else
                    console.log("huh? " + xDif + " " + yDif);
                    
                prevPos = curPos;
            }
            creep.memory._myMove.p = pathDirs;
            creep.memory._myMove.i = 0;
            creep.memory._myMove.d = dest;
            creep.memory._myMove.x = creep.pos.x;
            creep.memory._myMove.y = creep.pos.y;
            creep.memory._myMove.s = 0;
        }
        
        
        if(creep.memory._myMove.x !== creep.pos.x || creep.memory._myMove.y !== creep.pos.y)
        {
            creep.memory._myMove.x = creep.pos.x
            creep.memory._myMove.y = creep.pos.y;
            ++creep.memory._myMove.i;
            creep.memory._myMove.s = 0;
        }
        else if(creep.fatigue === 0)
        {
            ++creep.memory._myMove.s;
        }
        
        if(creep.memory._myMove.s > 6)
        {
            // Oh no, we're stuck!
            // Is some jerk blocking the highway?
            var nextPos;
            switch(creep.memory._myMove.p[creep.memory._myMove.i])
            {
                case TOP:           nextPos = new RoomPosition(creep.pos.x, creep.pos.y-1, creep.pos.roomName);     break;
                case TOP_RIGHT:     nextPos = new RoomPosition(creep.pos.x+1, creep.pos.y-1, creep.pos.roomName);   break;
                case RIGHT:         nextPos = new RoomPosition(creep.pos.x+1, creep.pos.y, creep.pos.roomName);     break;
                case BOTTOM_RIGHT:  nextPos = new RoomPosition(creep.pos.x+1, creep.pos.y+1, creep.pos.roomName);   break;
                case BOTTOM:        nextPos = new RoomPosition(creep.pos.x, creep.pos.y+1, creep.pos.roomName);     break;
                case BOTTOM_LEFT:   nextPos = new RoomPosition(creep.pos.x-1, creep.pos.y+1, creep.pos.roomName);   break;
                case LEFT:          nextPos = new RoomPosition(creep.pos.x-1, creep.pos.y, creep.pos.roomName);     break;
                case TOP_LEFT:      nextPos = new RoomPosition(creep.pos.x-1, creep.pos.y-1, creep.pos.roomName);   break;
            }
            //fixup room boundaries
            if(nextPos.x === -1)
            {
                nextPos.x = 49;
                nextPos.roomName = Game.map.describeExits(nextPos.roomName)[LEFT];
            }
            else if(nextPos.x === 50)
            {
                nextPos.x = 0;
                nextPos.roomName = Game.map.describeExits(nextPos.roomName)[RIGHT];
            }
            else if(nextPos.y === -1)
            {
                nextPos.y = 49;
                nextPos.roomName = Game.map.describeExits(nextPos.roomName)[TOP];
            }
            else if(nextPos.y === 50)
            {
                nextPos.y = 0;
                nextPos.roomName = Game.map.describeExits(nextPos.roomName)[BOTTOM];
            }

            if(nextPos === undefined)
            {
                console.log("Lets see " + creep.memory._myMove.p.length + " " + creep.memory._myMove.i + " " + creep.memory._myMove.p[creep.memory._myMove.i]);
                return;
            }
            const creeps = Game.rooms[nextPos.roomName].lookForAt(LOOK_CREEPS, nextPos);
            if(creeps.length > 0 && creeps[0].my)
            {
                creeps[0].memory.swapWithMe = creep.id;
                creep.memory._myMove.s = 0;
            }
            else // uuuh... what's in our way?
            {
                // Repath
                creep.memory._myMove.d = {x:-1,y:-1,roomName:""};
            }
        }
        
        return creep.move(creep.memory._myMove.p[creep.memory._myMove.i]);
    },
    
    checkSwaps: function(creep)
    {
        if(creep.memory.swapWithMe !== undefined)
        {
            const otherCreep = Game.getObjectById(creep.memory.swapWithMe);
            if(otherCreep && otherCreep.my)
            {
                if(utils.moveTo(creep, otherCreep.pos, {}) == OK)
                {
                    delete creep.memory.swapWithMe;
                    return true;
                }
            }
        }
        return false;
    }
};

module.exports = utils;