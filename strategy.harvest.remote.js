let c = require('consts');
let utils = require('utils');
let bTree = require('behaviourTree');
let strategyScout = require('strategy.scout');
let roomLayout = require('room.layout');
let strategyHarvest = require('strategy.harvest');

 /** @param {Room} room */
function ensureRemoteHarvest(room)
{
    const exits = Game.map.describeExits(room.name);
    for(const exitDir in exits)
    {
        bTree.sequence
        (
             _.partial(ensureSources, exits[exitDir])
            ,_.partial(ensureNeutral, exits[exitDir]) // Todo switch for dealing with source keepers
            ,_.partial(strategyScout.ensureVision, exits[exitDir])
            ,_.partial(ensureDefenses, exits[exitDir])
            ,_.partial(reserveController, exits[exitDir])            
            ,_.partial(spawnHarvesters, room, exits[exitDir])            
            ,_.partial(ensureInfrastructure, room.name, exits[exitDir])
        );
    }
    return bTree.SUCCESS;
}

 /** @param {String} roomName */
function ensureSources(roomName)
{
    if(Memory.mapInfo[roomName] !== undefined && Memory.mapInfo[roomName].sources.length > 0)
        return bTree.SUCCESS;
    else
        return bTree.FAIL;
}

 /** @param {String} roomName */
function ensureNeutral(roomName)
{
    if(Memory.mapInfo[roomName].hasController && Memory.mapInfo[roomName].controller.owner === undefined)
        return bTree.SUCCESS;
    else
        return bTree.FAIL;
}

 /** @param {String} sourceRoomName 
  *  @param {String} destRoomName 
  */
function ensureInfrastructure(sourceRoomName, destRoomName)
{
    const sourceRoom = Game.rooms[sourceRoomName];
    const destRoom = Game.rooms[destRoomName];
    if(Game.rooms[destRoomName].memory.layout === undefined)
    {
        destRoom.memory.layout = roomLayout.createRemoteHarvestLayout(sourceRoom, destRoom);
        roomLayout.apply(destRoom, destRoom.memory.layout);
        return bTree.INPROGRESS;
    }

    if(Game.creeps["Maintenance_" + destRoomName] === undefined 
        /*&& destRoom.find(FIND_STRUCTURES, {filter: (struct) => struct.hits < struct.hitsMax * .7}).length > 0*/)
    {
        utils.getCrossmapSpawner(destRoomName).createCreep([MOVE, MOVE, CARRY, CARRY, WORK, WORK]
            , "Maintenance_" + destRoomName
            , { role: 'maintenance', full: false, home: destRoomName });
    }

    if(Memory.mapInfo[destRoomName].sources.length > 1 && Game.creeps["Maintenance_" + destRoomName + "_B"] === undefined 
        /*&& destRoom.find(FIND_STRUCTURES, {filter: (struct) => struct.hits < struct.hitsMax * .7}).length > 0*/)
    {
        utils.getCrossmapSpawner(destRoomName).createCreep([MOVE, MOVE, CARRY, CARRY, WORK, WORK]
            , "Maintenance_" + destRoomName + "_B"
            , { role: 'maintenance', full: false, home: destRoomName });
    }

    if(destRoom.find(FIND_MY_CONSTRUCTION_SITES).length == 0)
    {
        return bTree.SUCCESS;
    }
    else
    {
        utils.spawnToCount
        (
            _.partial(utils.getCrossmapSpawner, destRoomName)
            , 1
            , [MOVE, MOVE, MOVE, WORK, WORK, CARRY, WORK, CARRY, CARRY]
            , "Builder_" + destRoomName + "_"
            , {role: c.ROLE_BUILDER, home:destRoomName}
        );
            return bTree.INPROGRESS;
    }
}

 /** @param {String} roomName */
function reserveController(roomName)
{
    const room = Game.rooms[roomName];
    if(!room.controller || (room.controller.reservation && room.controller.reservation.username === "Glenstorm" && room.controller.reservation.ticksToEnd > 3000))
        return bTree.SUCCESS;

    if(Game.creeps["Reserve_" + roomName] === undefined)
    {
        if(utils.getCrossmapSpawner(roomName).createCreep([MOVE, MOVE, CLAIM, CLAIM], "Reserve_" + roomName, {role:c.ROLE_RESERVER, home:roomName}) === OK)
            return bTree.INPROGRESS;
        else
            return bTree.FAIL;
    }
    else
        return bTree.SUCCESS;
}

 /** @param {Room} homeRoom
  *  @param {String} roomName
  */
function spawnHarvesters(homeRoom, roomName)
{
    return bTree.sequenceArray(_.partialRight(strategyHarvest.spawn,homeRoom),Game.rooms[roomName].find(FIND_SOURCES));
}

 /** @param {String} roomName */
function ensureDefenses(roomName)
{
    const room = Game.rooms[roomName];
    if(Game.creeps["Fighter" + roomName] === undefined && room.find(FIND_HOSTILE_CREEPS).length > 0 )
    {
        utils.getCrossmapSpawner(roomName).createCreep([TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK], "Fighter" + roomName, {role:c.ROLE_FIGHTER, home:roomName});
    }

    return bTree.SUCCESS;
}

module.exports = {
    ensureRemoteHarvest
};