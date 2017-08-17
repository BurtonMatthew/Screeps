let c = require('consts');
let utils = require('utils');
let bTree = require('behaviourTree');
let strategyScout = require('strategy.scout');
let roomLayout = require('room.layout');
let strategyHarvest = require('strategy.harvest');

 /** @param {Room} room */
function ensureRemoteHarvest(room)
{
    if(!room.controller || !room.controller.my || room.energyCapacityAvailable < 1100 || !room.storage)
        return bTree.SUCCESS;
    
    const exits = Game.map.describeExits(room.name);
    for(const exitDir in exits)
    {
        if(exits[exitDir] === "E36S4" || exits[exitDir] === "E34S4")
            continue;
                
        bTree.sequence
        (
             _.partial(strategyScout.ensureVision, exits[exitDir])
            ,_.partial(ensureSources, exits[exitDir])
            ,_.partial(ensureNeutral, exits[exitDir]) // Todo switch for dealing with source keepers
            ,_.partial(ensureDefenses, room, exits[exitDir])
            ,_.partial(reserveController, room, exits[exitDir])            
            ,_.partial(spawnHarvesters, room, exits[exitDir])            
            ,_.partial(ensureInfrastructure, room.name, exits[exitDir])
        );
    }
    return bTree.SUCCESS;
}

 /** @param {String} roomName */
function ensureSources(roomName)
{
    if(Game.rooms[roomName].find(FIND_SOURCES).length > 0)
        return bTree.SUCCESS;
    else
        return bTree.FAIL;
    //if(Memory.mapInfo[roomName] !== undefined && Memory.mapInfo[roomName].sources.length > 0)
    //    return bTree.SUCCESS;
    //else
    //    return bTree.FAIL;
}

 /** @param {String} roomName */
function ensureNeutral(roomName)
{
    const room = Game.rooms[roomName];
    if(room.controller && !room.controller.owner)
        return bTree.SUCCESS;
    else
        return bTree.FAIL;
    //return bTree.SUCCESS;
    //if(Memory.mapInfo[roomName].hasController && Memory.mapInfo[roomName].controller.owner === undefined)
    //    return bTree.SUCCESS;
    //else
    //    return bTree.FAIL;
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
        utils.getAvailableSpawner(sourceRoom).createCreep([MOVE, MOVE, CARRY, CARRY, WORK, WORK]
            , "Maintenance_" + destRoomName
            , { role: 'maintenance', full: false, home: destRoomName });
    }

    if(Game.rooms[destRoomName].find(FIND_SOURCES).length > 1 && Game.creeps["Maintenance_" + destRoomName + "_B"] === undefined 
        /*&& destRoom.find(FIND_STRUCTURES, {filter: (struct) => struct.hits < struct.hitsMax * .7}).length > 0*/)
    {
        utils.getAvailableSpawner(sourceRoom).createCreep([MOVE, MOVE, CARRY, CARRY, WORK, WORK]
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
            _.partial(utils.getAvailableSpawner, sourceRoom)
            , 1
            , [MOVE, MOVE, MOVE, WORK, WORK, CARRY, WORK, CARRY, CARRY]
            , "Builder_" + destRoomName + "_"
            , {role: c.ROLE_BUILDER, home:destRoomName}
        );
            return bTree.INPROGRESS;
    }
}

 /** @param {Room} homeRoom
  *  @param {String} roomName 
  */
function reserveController(homeRoom, roomName)
{
    const room = Game.rooms[roomName];
    if(!room.controller || (room.controller.reservation && room.controller.reservation.username === "Glenstorm" && room.controller.reservation.ticksToEnd > 3000))
        return bTree.SUCCESS;

    if(Game.creeps["Reserve_" + roomName] === undefined)
    {
        if(utils.getAvailableSpawner(homeRoom).createCreep([MOVE, MOVE, CLAIM, CLAIM], "Reserve_" + roomName, {role:c.ROLE_RESERVER, home:roomName}) === OK)
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

 /** @param {Room} homeRoom
  *  @param {String} roomName 
  */
function ensureDefenses(homeRoom, roomName)
{
    const room = Game.rooms[roomName];
    if(room.find(FIND_HOSTILE_CREEPS).length > 0)
    {
        if(Game.creeps["Fighter" + roomName] === undefined)
        {
            utils.getAvailableSpawner(homeRoom).createCreep([TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK], "Fighter" + roomName, {role:c.ROLE_FIGHTER, home:roomName});
        }
        return bTree.INPROGRESS;
    }

    return bTree.SUCCESS;
}

module.exports = {
    ensureRemoteHarvest
};