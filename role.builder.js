let utils = require('utils');

let priorityList =
{
    tower: 0,
    container: 1,
    link: 1,
    spawn: 2,
    storage: 2,
    extension: 3,
    extractor: 3,
    road: 4,
    constructedWall: 5,
    rampart: 5,
    keeperLair: 9,
    portal: 9,
    controller: 9,
    observer: 9,
    powerBank: 9,
    powerSpawn: 9,
    lab: 9,
    terminal: 9,
    nuker: 9
};
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(!creep.memory.full)
        {
            creep.memory.full = utils.fillEnergy(creep);
        }
        else if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
        }
        else
        {
            var target =_(_(creep.room.find(FIND_MY_CONSTRUCTION_SITES))
                .foldl(function(arr, n)
                        {
                            var curPri = (arr.length == 0) ? 0xff : priorityList[arr[0].structureType];
                            var newPri = priorityList[n.structureType];
                            if(newPri < curPri)
                                return [n];
                            else if(curPri == newPri)
                                return arr.concat([n]);
                            else
                                return arr; 
                        }, []))
                .sortBy(n => creep.pos.getRangeTo(n))
                .first();
                
            if(target)
            {
                if(creep.build(target) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target, {maxRooms:1});
                }
            }
            else
            {
                creep.memory.role = "maintenance";
            }
            
            if(creep.carry.energy == 0)
            {
                creep.memory.full = false;
            }
        }
	}
};

module.exports = roleBuilder;