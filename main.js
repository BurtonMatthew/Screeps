let c = require('consts');
let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleFighter = require('role.fighter');
let roleMaintenance = require('role.maintenance');
let roleExplorer = require('role.explorer');
let roleStaticHarvester = require('role.staticHarvester');
let roleExpander = require('role.expander');
let roleTruck = require('role.truck');
let roleHarasser = require('role.harasser');
let roleHauler = require('role.hauler');
let roleRefiller = require('role.refiller');
let roleStorageLink = require('role.storageLink');
let roleScout = require('role.scout');
let roleReserver = require('role.reserver');
let roleTerminalDumper = require('role.terminalDumper');
let roleRangedDefense = require('role.rangedDefense');
let roomExpansion = require('room.expansion');
let strategyKeeperRoom = require('strategy.keeperRoom');
let strategyAssault = require('strategy.assault');
let roomLayout = require('room.layout');
let roomUpgrade = require('room.upgrade');


const profiler = require('screeps-profiler');
profiler.enable();
profiler.registerObject(roleHarvester, 'roleHarvester');
profiler.registerObject(roleUpgrader, 'roleUpgrader');
profiler.registerObject(roleBuilder, 'roleBuilder');
profiler.registerObject(roleFighter, 'roleFighter');
profiler.registerObject(roleMaintenance, 'roleMaintenance');
profiler.registerObject(roleExplorer, 'roleExplorer');
profiler.registerObject(roleStaticHarvester, 'roleStaticHarvester');
profiler.registerObject(roleExpander, 'roleExpander');
profiler.registerObject(roleTruck, 'roleTruck');
profiler.registerObject(roleHarasser, 'roleHarasser');
profiler.registerObject(roleHauler, 'roleHauler');
profiler.registerObject(roleRefiller, 'roleRefiller');
profiler.registerObject(roleStorageLink, 'roleStorageLink');
profiler.registerObject(roleScout, 'roleScout');
profiler.registerObject(roleReserver, 'roleReserver');
profiler.registerObject(roomExpansion, 'roomExpansion');
profiler.regi

module.exports.loop = function () 
{
    profiler.wrap(function()
    {
        if(Game.cpu.bucket < 200)
        {
            console.log("NO BUCKET");
            return;
        }

        for(var name in Memory.creeps) 
        {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }

        for(var name in Game.rooms)
        {
            //continue;
            var room = Game.rooms[name];
            if(room.controller !== undefined && room.controller.my)
            {
                roomExpansion.run(room);
            }

            if("layout" in room.memory)
            {
                if(room.memory.lastApply === undefined || room.memory.lastApply + 730 < Game.time)
                {
                    roomLayout.apply(room, room.memory.layout);
                    room.memory.lastApply = Game.time;
                }
            }
            else
            {
                //room.memory.layout = roomLayout.createBaseLayout(room);
            }
        }
        
        for(var name in Game.flags)
        {
            //continue;
            if(Game.flags[name].name == "keeper")
                strategyKeeperRoom.run(Game.rooms[Game.flags[name]]);
        }
        
        for(var i in Game.creeps) 
        {
            //continue;
            var creep = Game.creeps[i];
            if(creep.memory.role === 'harvester' || creep.memory.role === c.ROLE_HARVESTER)
            {
                roleHarvester.run(creep);
            }
            else if(creep.memory.role === 'upgrader' || creep.memory.role === c.ROLE_UPGRADER)
            {
                roleUpgrader.run(creep);
            }
            else if(creep.memory.role === 'explorer' || creep.memory.role === c.ROLE_EXPLORER)
            {
                roleExplorer.run(creep);
            }
            else if(creep.memory.role === 'builder' || creep.memory.role === c.ROLE_BUILDER)
            {
                roleBuilder.run(creep);
            }
            else if(creep.memory.role === 'fighter'|| creep.memory.role === c.ROLE_FIGHTER)
            {
                roleFighter.run(creep);
            }
            else if(creep.memory.role === "maintenance" || creep.memory.role == c.ROLE_REPAIRER)
            {
                roleMaintenance.run(creep);
            }
            else if(creep.memory.role == "staticharvester" || creep.memory.role == c.ROLE_STATIC_HARVESTER)
            {
                roleStaticHarvester.run(creep);
            }
            else if(creep.memory.role == "expander" || creep.memory.role == c.ROLE_EXPANDER)
            {
                roleExpander.run(creep);
            }
            else if(creep.memory.role == "truck" || creep.memory.role == c.ROLE_TRUCK)
            {
                roleTruck.run(creep);
            }
            else if(creep.memory.role == "harasser" || creep.memory.role == c.ROLE_HARASSER)
            {
                roleHarasser.run(creep);
            }
            else if(creep.memory.role == "hauler" || creep.memory.role == c.ROLE_HAULER)
            {
                roleHauler.run(creep);
            }
            else if(creep.memory.role == "refiller" || creep.memory.role == c.ROLE_REFILLER)
            {
                roleRefiller.run(creep);
            }
            else if(creep.memory.role == "storagelink" || creep.memory.role == c.ROLE_STORAGE_LINK)
            {
                roleStorageLink.run(creep);
            }
            else if(creep.memory.role == "scout" || creep.memory.role == c.ROLE_SCOUT)
            {
                roleScout.run(creep);
            }
            else if(creep.memory.role === c.ROLE_RESERVER)
            {
                roleReserver.run(creep);
            }
            else if(creep.memory.role === c.ROLE_TERMINAL_DUMPER)
            {
                roleTerminalDumper.run(creep);
            }
            else if(creep.memory.role == "rangedDefense")
            {
                roleRangedDefense.run(creep);
            }
        }

        strategyAssault.run();
    });
}