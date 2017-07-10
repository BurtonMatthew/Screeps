var utils = require('utils');
var roleTerminalDumper = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(!creep.memory.full)
        {
            if(creep.carry[RESOURCE_ENERGY] === 0 && creep.room.terminal.store[RESOURCE_ENERGY] < 150000)
            {
                if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    creep.moveTo(creep.room.storage);
            }
            else
            {
                const maxRsc = _(creep.room.storage.store)
                                .keys()
                                .filter((key) => key !== RESOURCE_ENERGY)
                                .max((key) => creep.room.storage.store[key]);

                if(creep.withdraw(creep.room.storage, maxRsc) == ERR_NOT_IN_RANGE)
                    creep.moveTo(creep.room.storage);
            }

            if(_.sum(creep.carry) === creep.carryCapacity)
                creep.memory.full = true;
        }
        else
        {
            const maxRsc = _(creep.carry)
                                .keys()
                                .max((key) => creep.carry[key]);

            if(creep.transfer(creep.room.terminal, maxRsc) === ERR_NOT_IN_RANGE)
                creep.moveTo(creep.room.terminal);

            if(_.sum(creep.carry) === 0)
                creep.memory.full = false;
        }
	}
};

module.exports = roleTerminalDumper;