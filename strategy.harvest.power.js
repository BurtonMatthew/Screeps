let c = require('consts');
let utils = require('utils');
let bTree = require('behaviourTree');
let strategyScout = require('strategy.scout');
let roomLayout = require('room.layout');
let strategyHarvest = require('strategy.harvest');

 /** @param {Room} room */
function harvestPower(room)
{
    if(!room.controller || !room.controller.my || room.controller.level < 7)
        return bTree.SUCCESS;
    
    const nearbyRooms = getNearbyHighwayRoomNames(room.name);
    for(var i=0; i<nearbyRooms.length; ++i)
    {
        bTree.sequence
        (
             _.partial(strategyScout.ensureVision, nearbyRooms[i])
            ,_.partial(selectMineStrat, room, Game.rooms[nearbyRooms[i]])
        );
    }
    return bTree.SUCCESS;
}

function selectMineStrat(sourceRoom, toRoom)
{
    return bTree.select
    (
         _.partial(minePowerNode, sourceRoom, toRoom)
        ,_.partial(retrievePower, sourceRoom, toRoom)
        ,_.partial(returnPowerToStorage, sourceRoom, toRoom)
    );
}

function minePowerNode(sourceRoom, toRoom)
{
    return bTree.sequence
    (
        _.partial(ensurePowerBank, toRoom.name)
        ,_.partial(minePower, sourceRoom, toRoom)
    );
}

 /** @param {String} roomName */
function getNearbyHighwayRoomNames(roomName)
{
    var result = [];
    const roomCoord = utils.splitRoomname(roomName);
    if(Math.abs(roomCoord.x) % 10 === 1)
    {
        result.push(utils.roomCoordToName({x:roomCoord.x -1, y: roomCoord.y}));
        result.push(utils.roomCoordToName({x:roomCoord.x -1, y: roomCoord.y-1}));
        result.push(utils.roomCoordToName({x:roomCoord.x -1, y: roomCoord.y+1}));
    }
    else if(Math.abs(roomCoord.x) % 10 === 9)
    {
        result.push(utils.roomCoordToName({x:roomCoord.x +1, y: roomCoord.y}));
        result.push(utils.roomCoordToName({x:roomCoord.x +1, y: roomCoord.y-1}));
        result.push(utils.roomCoordToName({x:roomCoord.x +1, y: roomCoord.y+1}));
    }

    if(Math.abs(roomCoord.y) % 10 === 1)
    {
        result.push(utils.roomCoordToName({x:roomCoord.x,    y: roomCoord.y-1}));
        result.push(utils.roomCoordToName({x:roomCoord.x -1, y: roomCoord.y-1}));
        result.push(utils.roomCoordToName({x:roomCoord.x +1, y: roomCoord.y-1}));
    }
    else if(Math.abs(roomCoord.y) % 10 === 9)
    {
        result.push(utils.roomCoordToName({x:roomCoord.x,    y: roomCoord.y+1}));
        result.push(utils.roomCoordToName({x:roomCoord.x -1, y: roomCoord.y+1}));
        result.push(utils.roomCoordToName({x:roomCoord.x +1, y: roomCoord.y+1}));
    }

    if(roomName === "E38S1")
    {
        //result.push("E35S0");
        result.push("E40S0");
        result.push("E36S0");
    }

    return result;
}

 /** @param {String} roomName */
function ensurePowerBank(roomName)
{
    const room = Game.rooms[roomName];

    if(room.find(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_POWER_BANK && s.power > 2400}).length > 0)
        return bTree.SUCCESS;
    else
        return bTree.FAIL;
}

/** 
 * @param {Room} sourceRoom 
 * @param {Room} destRoom 
 */
function minePower(sourceRoom, destRoom)
{
    const powerBanks = destRoom.find(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_POWER_BANK});

    const minerName = "PowerMiner_" + destRoom.name;
    const healer1Name = "PowerHealer_1_" + destRoom.name;
    const healer2Name = "PowerHealer_2_" + destRoom.name;
    const haulerName = "PowerHauler" + destRoom.name;
    const healerCreepNames = [healer1Name, healer2Name];

    const minerCreep = Game.creeps[minerName];
    const healer1Creep = Game.creeps[healer1Name];
    const healer2Creep = Game.creeps[healer2Name];
    const haulerCreep = Game.creeps[haulerName];
    const healerCreeps = [healer1Creep, healer2Creep];

    if(minerCreep)
    {
        if(minerCreep.hits > 1000 && minerCreep.attack(powerBanks[0]) === ERR_NOT_IN_RANGE)
        {
            minerCreep.moveTo(powerBanks[0], {range:1});
        }
    }
    else
    {
        utils.getAvailableSpawner(sourceRoom).createCreep([  MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
                                                            ,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
                                                            ,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK
                                                            ,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK]
                                                        , minerName);
    }

    for(var i=0; i<healerCreeps.length; ++i)
    {
        const healerCreep = healerCreeps[i];
        if(healerCreep)
        {
            if(minerCreep)
            {
                healerCreep.moveTo(minerCreep, {range:1});
                if(minerCreep.hits < minerCreep.hitsMax)
                    healerCreep.heal(minerCreep);
            }
        }
        else
        {
            utils.getAvailableSpawner(sourceRoom).createCreep([  MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
                                                                ,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]
            , healerCreepNames[i]);
        }
    }

    if(haulerCreep)
    {
        haulerCreep.moveTo(powerBanks[0], {range:2});
        /*
        if(_.sum(haulerCreep.carry === haulerCreep.carryCapacity))
        {
            if(sourceRoom.storage && haulerCreep.transfer(sourceRoom.storage, RESOURCE_POWER) === ERR_NOT_IN_RANGE)
            {
                haulerCreep.moveTo(sourceRoom.storage, {range:1});
            }
        }
        else if(minerCreep)
        {
            if(minerCreep.transfer(haulerCreep, RESOURCE_POWER) === ERR_NOT_IN_RANGE)
                haulerCreep.moveTo(minerCreep, {range:1});
        }
        */
    }
    else if(powerBanks[0].hits < 100000)
    {
        utils.getAvailableSpawner(sourceRoom).createCreep([  MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
                                                            ,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
                                                            ,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY
                                                            ,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], haulerName);
    }

    return bTree.SUCCESS;
}

function retrievePower(sourceRoom, toRoom)
{
    const power = toRoom.find(FIND_DROPPED_RESOURCES, {filter: (s) => s.resourceType === RESOURCE_POWER});
    if(power.length < 1)
    {
        return bTree.FAIL;
    }

    const haulerName = "PowerHauler" + toRoom.name;
    const haulerCreep = Game.creeps[haulerName];

    if(haulerCreep)
    {
        if(_.sum(haulerCreep.carry) === haulerCreep.carryCapacity)
        {
            if(sourceRoom.storage && haulerCreep.transfer(sourceRoom.storage, RESOURCE_POWER) === ERR_NOT_IN_RANGE)
            {
                haulerCreep.moveTo(sourceRoom.storage, {range:1});
            }
        }
        else if(haulerCreep.pickup(power[0]) === ERR_NOT_IN_RANGE)
        {
            haulerCreep.moveTo(power[0], {range:1});
        }
    }
    else
    {
        utils.getAvailableSpawner(sourceRoom).createCreep([  MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
                                                            ,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
                                                            ,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY
                                                            ,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], haulerName);
    }

    return bTree.SUCCESS;
}

function returnPowerToStorage(sourceRoom, toRoom)
{
    const haulerName = "PowerHauler" + toRoom.name;
    const haulerCreep = Game.creeps[haulerName];

    if(haulerCreep && _.sum(haulerCreep.carry) > 0)
    {
        if(sourceRoom.storage && haulerCreep.transfer(sourceRoom.storage, RESOURCE_POWER) === ERR_NOT_IN_RANGE)
        {
            haulerCreep.moveTo(sourceRoom.storage, {range:1});
        }
    }


    return bTree.SUCCESS;
}


module.exports = {
    harvestPower
};