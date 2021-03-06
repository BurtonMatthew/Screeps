let mapM = require('map.memory');
let utils = require('utils');
let bTree = require('behaviourTree');

function spawn(room)
{
    //if(room.storage === undefined || room.storage.store[RESOURCE_ENERGY] < 2000)
    //    return bTree.SUCCESS;
        
    const myControllers = _.filter(Game.structures, (struct) => struct.structureType == STRUCTURE_CONTROLLER);
    if(Game.gcl.level > myControllers.length && _.filter(Game.creeps, (creep) => creep.name == "Expander").length < 1 )
    {
        const expansionRoom = getBestExpansionRoom();
        const route = Game.map.findRoute(room, expansionRoom);
        if(route.length > 0 && route.length < 9)
        {
            utils.getAvailableSpawner(room).createCreep( [CLAIM, MOVE, MOVE, MOVE, MOVE], 'Expander', { role: 'expander', home: expansionRoom });
            return bTree.INPROGRESS; 
        }
    }
    
    for(var i=0, len=myControllers.length; i<len; ++i)
    {
        if((myControllers[i].level < 2 && !myControllers[i].room.storage )|| myControllers[i].room.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_SPAWN}).length == 0)
        {
            const route = Game.map.findRoute(room, myControllers[i].room.name, {
                routeCallback(roomName, fromRoomName) {
                    //if(mapM.isHostile(roomName)) { return Infinity; }
                    return 1;
                    }});
            if(route.length > 0 && route.length < 9)
            {
                if(_.filter(Game.creeps, (creep) => creep.name == ("ExpUpgrader" + myControllers[i].room.name)).length < 1)
                {
                    utils.getAvailableSpawner(room).createCreep( [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], ("ExpUpgrader" + myControllers[i].room.name), { role: 'upgrader', full: false, home: myControllers[i].room.name });
                    return bTree.INPROGRESS; 
                }
                
                if(_.filter(Game.creeps, (creep) => creep.name == ("ExpMaintainer" + myControllers[i].room.name)).length < 1)
                {
                    utils.getAvailableSpawner(room).createCreep( [WORK,WORK,CARRY,CARRY,WORK,MOVE,MOVE,MOVE,MOVE,MOVE], ("ExpMaintainer" + myControllers[i].room.name), { role: 'maintenance', full: false, home: myControllers[i].room.name });
                    return bTree.INPROGRESS;
                }
                
                for(var j=0; j<4; ++j)
                {
                    if(_.filter(Game.creeps, (creep) => creep.name == ("ExpBuilder" + myControllers[i].room.name + j)).length < 1)
                    {
                        utils.getAvailableSpawner(room).createCreep( [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], ("ExpBuilder" + myControllers[i].room.name + j), { role: 'builder', full: false, home: myControllers[i].room.name });
                        return bTree.INPROGRESS;
                    }
                }

                /*
                for(var j=0; j<20; ++j)
                {
                    if(_.filter(Game.creeps, (creep) => creep.name == ("ExpTruck" + myControllers[i].room.name + j)).length < 1)
                    {
                        utils.getAvailableSpawner(room).createCreep( [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], ("ExpTruck" + myControllers[i].room.name + j), { role: 'truck', full: false, home: myControllers[i].room.name });
                        return bTree.INPROGRESS;
                    }
                }
                */

            }
        }
    }
    
    return bTree.SUCCESS;
}

function getBestExpansionRoom()
{
    return "E31S4";
    var bestRoom = "";
    var bestRoomWeight = 0;
    var myMinerals = { O: 1, U: 1 }; // Todo actually scan these out
    for(roomName in Memory.mapInfo)
    {
        if(roomName == "unexploredRooms")
            continue;
        
        var room = Memory.mapInfo[roomName];
        if(!room.hasController || room.controller.my || room.isHostile)
            continue;
        
        var totalScore = (sourceScore(room)                   * 0.45)
                        +(distanceScore(roomName)             * 0.18)
                        +(compactScore(room)                  * 0.02)
                        +(mineralScore(myMinerals, room)      * 0.20)
                        +(continguousScore(roomName)          * 0.10)
                        +(sourceKeeperAdjacentScore(roomName) * 0.05);
        
        if(totalScore > bestRoomWeight)
        {
            bestRoomWeight = totalScore;
            bestRoom = roomName;
        }
    }
    
    return bestRoom;
}

function sourceScore(room)
{
    return room.sources.length / 2.0;
}

function distanceScore(roomName)
{
    const myRooms = _.filter(Game.rooms, room => room.controller && room.controller.my);
    var bestRouteLength = Infinity;
    for(var i=0, len=myRooms.length; i<len; ++i)
    {
        const route = Game.map.findRoute(myRooms.name, roomName, {
        routeCallback(roomName, fromRoomName) {
            if(mapM.isHostile(roomName)) { return Infinity; }
            return 1;
            }
        });
        if(route != ERR_NO_PATH && route.length > 0 && route.length < bestRouteLength)
            bestRouteLength = route.length
    }
    
    return 1 / bestRouteLength;
}

function compactScore(room)
{
    var minX = room.controller.pos.x;
    var maxX = room.controller.pos.x;
    var minY = room.controller.pos.y;
    var maxY = room.controller.pos.y;
    
    for(var i=0; i<room.sources.length; ++i)
    {
        minX = Math.min(minX, room.sources[i].pos.x);
        maxX = Math.max(maxX, room.sources[i].pos.x);
        minY = Math.min(minY, room.sources[i].pos.y);
        maxY = Math.max(maxY, room.sources[i].pos.y);
    }
    
    return 1 / Math.sqrt((maxX - minX + 1) * (maxY - minY + 1));
}

function mineralScore(myMinerals, room)
{
    var score = 0;
    
    for(var i=0; i<room.minerals.length; ++i)
    {
        if(!(room.minerals[i].mineralType in myMinerals))
        {
            score += 0.5;
        }
        
        switch(room.minerals[i].mineralType)
        {
            case RESOURCE_HYDROGEN:
            case RESOURCE_OXYGEN:
                score += 0.1;
                break;
            case RESOURCE_UTRIUM:
            case RESOURCE_LEMERGIUM:
            case RESOURCE_KEANIUM:
            case RESOURCE_ZYNTHIUM:
                score += 0.2;
                break;
            case RESOURCE_CATALYST:
                score += 0.5;
                break;
        }
    }
    
    return score;
}

function continguousScore(roomName)
{
    const myRooms = _(Game.rooms).filter(room => room.controller && room.controller.my)
                                 .map(room => room.name);
    var score = 1.0;
    // add 0.25 for each adjacent connection we're making
    score +=  _(myRooms).map(room => _.values(Game.map.describeExits(room)))
                        .flatten()
                        .filter(name => name == roomName)
                        .value().length * 0.25;
    // sub 0.25 for each new hostile connection
    score -= _(Game.map.describeExits(roomName)).values()
                        .filter(exit => !_.any(myRooms, exit))
                        .value().length * 0.25
    return score;
}

function sourceKeeperAdjacentScore(roomName)
{
    const myRoomsAdj = _(Game.rooms).filter(room => room.controller && room.controller.my)
                                 .map(room => _.values(Game.map.describeExits(room.name)))
                                 .flatten()
                                 .value();

    const sourceKeeperRooms = ["W4N4", "W5N4", "W6N4", "W4N5", "W6N5", "W4N6", "W5N6", "W6N6"];

    
    var result = _(Game.map.describeExits(roomName))
                .values()
                .filter(room => _.contains(sourceKeeperRooms, room) && !_.contains(myRoomsAdj))
                .value().length > 0 ? 1 : 0;

    return result
}

module.exports = {
    spawn,
    getBestExpansionRoom
};