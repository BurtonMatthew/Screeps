var utils = require('utils');
let bTree = require('behaviourTree');

function spawn(room)
{
    const workRemaining = _(room.find(FIND_MY_CONSTRUCTION_SITES)).map(site=> site.progressTotal - site.progress).sum();
    const numBuilders = Math.min(2, Math.ceil(workRemaining/1000));
    
    if(utils.spawnToCount(_.partial(utils.getAvailableSpawner, room), numBuilders,
                getBodyPartsBuilder(room), "Builder" + room.name, { role: 'builder', full: false, home: room.name }))
        return bTree.INPROGRESS;

    return bTree.SUCCESS
}

function getBodyPartsBuilder(room)
{
    var roomEnergy = room.energyCapacityAvailable;
    var workParts = 0;
    var parts = [];
    while(workParts < 3 && roomEnergy >= 200)
    {
        roomEnergy -= 200
        workParts++;
        parts.push(WORK);
        parts.push(MOVE);
        parts.push(CARRY);
    }

    return parts;
}

module.exports = {
    spawn
};