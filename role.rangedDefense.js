var utils = require('utils');

function clampPos(pos, xMin, xMax, yMin, yMax)
{
    var x = pos.x;
    var y = pos.y;
    if(x < xMin)
        x = xMin;
    else if(x > xMax)
        x =xMax;

    if(y < yMin)
        y = yMin;
    else if(y > yMax)
        y = yMax;

    return new RoomPosition(x,y,pos.roomName);
}

var roleRangedDefense =
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        
        if(!creep.memory.flagNum)
            creep.memory.flagNum = Math.floor(Math.random() * 2);

        if(target)
        {
            //var rampart = target.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
            //if(rampart)
            //    creep.moveTo(rampart);
            //else
            creep.moveTo(clampPos(target.pos,3,46,3,46));
            creep.rangedAttack(target);
            //creep.rangedMassAttack();
        }
        else if(creep.memory.flagNum === 0 && Game.flags["Rally"])
        {
            creep.moveTo(Game.flags["Rally"]);
        }
        else if(creep.memory.flagNum === 1 && Game.flags["Rally"])
        {
            creep.moveTo(Game.flags["Rally"]);
        }
        
    }
};

module.exports = roleRangedDefense;