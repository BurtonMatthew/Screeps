let utils = require('utils');
let bTree = require('behaviourTree');
let strategyScout = require('strategy.scout');

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

 /** @param {String} roomName */
function ensureNeutral(roomName)
{
    if(Memory.mapInfo[roomName].hasController && Memory.mapInfo[roomName].controller.owner === undefined)
        return bTree.SUCCESS;
    else
        return bTree.FAIL;
}


module.exports = {
    ensureRemoteHarvest
};