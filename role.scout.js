var utils = require('utils');
var roleScout = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
        }
        else
        {
            creep.moveTo(25,25, {range: 20});
        }
	}
};

module.exports = roleScout;