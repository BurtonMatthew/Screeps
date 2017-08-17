let c = require('consts');
let utils = require('utils');
let bTree = require('behaviourTree');

const NUM_UPGRADERS = 7

var roomUpgrade = {
    
    /** @param {Room} room **/
    run: function(room) 
    {
        var refiller = Game.creeps["Refiller_" + room.name];
        /** @type {Creep[]} */
        var upgraders = new Array(NUM_UPGRADERS);
        for(var i=0; i<NUM_UPGRADERS; ++i)
        {
            upgraders[i] = Game.creeps["Upgrader_" + room.name + "_" + i];
        }

        /** @type {StructureSpawn} */
        var spawn = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN})[0];
        /** @type {StructureLab} */
        var lab = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LAB})[0];

        // Yawn hardcoded
        const refillerPos = new RoomPosition(16,36,"W6N2");
        const upgraderPos = [new RoomPosition(15,36,"W6N2")
                            ,new RoomPosition(14,36,"W6N2")
                            ,new RoomPosition(14,37,"W6N2")
                            ,new RoomPosition(14,38,"W6N2")
                            ,new RoomPosition(15,38,"W6N2")
                            ,new RoomPosition(16,38,"W6N2")
                            ,new RoomPosition(16,37,"W6N2")
                            ];
        
        // Todo fill up the nearby extensions
        if(refiller)
        {
            if(refiller.pos.x !== refillerPos.x || refiller.pos.y !== refillerPos.y || refiller.pos.roomName !== refillerPos.roomName)
                refiller.moveTo(refillerPos);
                //refiller.moveTo(new RoomPosition(4,22,"W7N3"), {range:1, maxOps:25000});
            else if(spawn.energy < 100)
            {
                if(refiller.carry[RESOURCE_ENERGY] >= 200)
                    refiller.transfer(spawn, RESOURCE_ENERGY);
                else
                {
                    refiller.withdraw(room.terminal, RESOURCE_ENERGY, 200);
                }
            }
            else if(lab.energy < lab.energyCapacity - refiller.carryCapacity)
            {
                if(_.sum(refiller.carry) === refiller.carryCapacity)
                    refiller.transfer(lab, RESOURCE_ENERGY);
                else
                    refiller.withdraw(room.terminal, RESOURCE_ENERGY);
            }
            else if(room.terminal.store[RESOURCE_ENERGY] > 10000 && room.storage.store[RESOURCE_ENERGY] < 900000)
            {
                if(_.sum(refiller.carry) === refiller.carryCapacity)
                    refiller.transfer(room.storage, RESOURCE_ENERGY);
                else
                    refiller.withdraw(room.terminal, RESOURCE_ENERGY);
            }
            else if(room.controller.level === 8)
            {
                /** @type {StructureExtension[]} */
                const extensions = room.find(FIND_MY_STRUCTURES, 
                    {filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity});

                if(extensions.length > 0)
                {
                    if(_.sum(refiller.carry) === refiller.carryCapacity)
                        refiller.transfer(extensions[0], RESOURCE_ENERGY);
                    else
                        refiller.withdraw(room.terminal, RESOURCE_ENERGY);
                }
            }
        }

        for(var i=0; i<NUM_UPGRADERS; ++i)
        {
            if(upgraders[i])
            {
                if(!upgraders[i].pos.isNearTo(room.storage))
                    upgraders[i].moveTo(room.storage, {range:1, maxOps:150000});
                    //upgraders[i].moveTo(new RoomPosition(25,16,"W6N3"), {range:1, maxOps:25000});
                    //upgraders[i].moveTo(new RoomPosition(4,22,"W7N3"), {range:1, maxOps:25000});
                    //utils.navToRoom(upgraders[i], "W6N2");
                else
                {
                    upgraders[i].upgradeController(room.controller);
                    upgraders[i].withdraw(room.storage, RESOURCE_ENERGY);
                }
            }
        }

        var upCreeps = room.lookForAt(LOOK_CREEPS, upgraderPos[6]);

        if(upCreeps.length === 0 || upCreeps[0].ticksToLive >= 1480)
        {
            // If all upgraders can move
            if( _(upgraders)
                .map((c) => c ? c.fatigue : 0)
                .max() === 0)
            {
                // Dance around the storage
                for(var i=0; i<NUM_UPGRADERS; ++i)
                {
                    if(upgraders[i])
                    {
                        for(var j=0; j<NUM_UPGRADERS; j++)
                        {
                            if(upgraders[i].pos.x === upgraderPos[j].x
                                && upgraders[i].pos.y === upgraderPos[j].y
                                && upgraders[i].pos.roomName === upgraderPos[j].roomName)
                            {
                                upgraders[i].moveTo(upgraderPos[(j+1)%NUM_UPGRADERS]);
                            }
                        }
                    }
                }
            }
        }

        // renew
        if(upCreeps.length > 0 && upCreeps[0].ticksToLive < 1480)
        {
            spawn.renewCreep(upCreeps[0]);
        }
        else if(refiller && refiller.ticksToLive < 1400)
        {
            spawn.renewCreep(refiller);
        }

        if(room.terminal.store[RESOURCE_ENERGY] < 200000)
            global.term = {};


        if(room.controller.my && room.controller.level === 8 
            && room.terminal.store[RESOURCE_ENERGY] > _(_.range(1,5)).map((x) => CONTROLLER_LEVELS[x]).sum())
        {
            var claimer = Game.creeps["Claimer_" + room.name];
            if(!claimer)
            {
                spawn.createCreep([MOVE,CLAIM], "Claimer_" + room.name);
            }
            else
            {
                room.controller.unclaim();
            }
        }
        else if(!room.controller.my)
        {
            var claimer = Game.creeps["Claimer_" + room.name];
            if(claimer)
            {
                if(claimer.claimController(room.controller) === ERR_NOT_IN_RANGE)
                    claimer.moveTo(room.controller);
            }
        }
        else if(room.controller.my && room.controller.level === 1)
        {
            var claimer = Game.creeps["Claimer_" + room.name];
            if(claimer)
                claimer.suicide();
        }

        var upgradeHack = Game.creeps["UP_" + room.name];
        if(!upgradeHack)
            Game.spawns["Spawn17"].createCreep([MOVE,MOVE,CARRY,CARRY,WORK,WORK], "UP_" + room.name, 
                {full: false, role:c.ROLE_UPGRADER, home:room.name});
    }
}
module.exports = roomUpgrade;