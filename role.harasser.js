var utils = require('utils');
roleHarasser =
{
     /** @param {Creep} creep **/
    run: function(creep) 
    {
        const tarRoom = "W1N1";
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
            const tower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
            if(tower)
            {
                const ret = creep.attack(tower);
                if(ret == ERR_NOT_IN_RANGE || ret == ERR_NO_BODYPART)
                {
                    creep.moveTo(tower);
                }
            }
        }
    }
}

module.exports = roleHarasser;