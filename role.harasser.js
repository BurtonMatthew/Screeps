var utils = require('utils');
roleHarasser =
{
     /** @param {Creep} creep **/
    run: function(creep) 
    {
        const tarRoom = "W2N2";
        if(creep.room.name != tarRoom)
        {
            utils.navToRoom(creep, tarRoom);
        }
        //else
        //{
        //    creep.moveTo(36,9, {reusePath:1});
        //}
        else
        {
            const tower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_TOWER; }});
            if(tower)
            {
                const ret = creep.rangedAttack(tower);
                if(ret == ERR_NOT_IN_RANGE || ret == ERR_NO_BODYPART)
                {
                    creep.moveTo(tower);
                }
            }
        }
    }
}

module.exports = roleHarasser;