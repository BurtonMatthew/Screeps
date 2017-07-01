let utils = require('utils');
let bTree = require('behaviourTree');
let strategyScout = require('strategy.scout');

 /** @param {Room} room */
function ensureRemoteHarvest(room)
{
    const exits = Game.map.describeExits(room.name);
    for(const exitName in exits)
    {
        bTree.sequence
        (
             _.partial(ensureSources, room.name)
            ,_.partial(ensureNeutral, room) // Todo switch for dealing with source keepers
            ,_.partial(strategyScout.ensureVision, exits[exitName])
            // ensure infrastructure
            // strat harvest
            // claimer
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

 /** @param {Room} room */
function ensureNeutral(room)
{
    if(room.controller !== undefined && room.controller.owner === undefined)
        return bTree.SUCCESS;
    else
        return bTree.FAIL;
}


module.exports = {
    ensureRemoteHarvest
};