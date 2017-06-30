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
            // ensure has sources
            // ensure not hostile (figure out source keepers later)
            _.partial(strategyScout.ensureVision, exits[exitName])
            // ensure infrastructure
            // strat harvest
            // claimer
        );
    }
    return bTree.SUCCESS;
}

module.exports = {
    ensureRemoteHarvest
};