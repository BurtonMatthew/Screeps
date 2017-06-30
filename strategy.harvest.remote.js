let utils = require('utils');
let bTree = require('behaviourTree');
let strategyScout = require('strategy.scout');

function ensureRemoteHarvest(room)
{
    const exits = Game.map.describeExits(room.name);
    for(const exitName in exits)
    {
        bTree.sequence
        (
            _.partial(strategyScout.ensureVision, exits[exitName])
        );
    }
    return bTree.SUCCESS;
}

module.exports = {
    ensureRemoteHarvest
};