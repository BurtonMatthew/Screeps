var utils = require('utils');
function spawn(room)
{
    const workRemaining = _(room.find(FIND_MY_CONSTRUCTION_SITES)).map(site=> site.progressTotal - site.progress).sum();
    const numBuilders = Math.min(4, Math.ceil(workRemaining/3000));
    
    return utils.spawnToCount(_.partial(utils.getAvailableSpawner, room), numBuilders,
                getBodyPartsBuilder(room), "Builder" + room.name, { role: 'builder', full: false, home: room.name });
}

function getBodyPartsBuilder(room)
{
    var roomEnergy = room.energyCapacityAvailable;
    var workParts = 0;
    var parts = [];
    while(workParts < 2 && roomEnergy >= 200)
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