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
let roomExpansion = require('room.expansion');
let strategyKeeperRoom = require('strategy.keeperRoom');

module.exports.loop = function () 
{
    for(var name in Memory.creeps) 
    {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
    
    for(var name in Game.rooms)
    {
        var room = Game.rooms[name];
        if(room.controller !== undefined && room.controller.my)
            roomExpansion.run(room);
    }
    
    for(var name in Game.flags)
    {
        if(Game.flags[name].name == "keeper")
            strategyKeeperRoom.run(Game.rooms[Game.flags[name]]);
    }
    
    for(var i in Game.creeps) 
    {
        var creep = Game.creeps[i];
        if(creep.memory.role == 'harvester')
        {
            roleHarvester.run(creep);
        }
        else if(creep.memory.role == 'upgrader')
        {
            roleUpgrader.run(creep);
        }
        else if(creep.memory.role == 'explorer')
        {
            roleExplorer.run(creep);
        }
        else if(creep.memory.role == 'builder')
        {
            roleBuilder.run(creep);
        }
        else if(creep.memory.role == 'fighter')
        {
            roleFighter.run(creep);
        }
        else if(creep.memory.role == "maintenance")
        {
            roleMaintenance.run(creep);
        }
        else if(creep.memory.role == "staticharvester")
        {
            roleStaticHarvester.run(creep);
        }
        else if(creep.memory.role == "expander")
        {
            roleExpander.run(creep);
        }
        else if(creep.memory.role == "truck")
        {
            roleTruck.run(creep);
        }
        else if(creep.memory.role == "harasser")
        {
            roleHarasser.run(creep);
        }
        else if(creep.memory.role == "hauler")
        {
            roleHauler.run(creep);
        }
        else if(creep.memory.role == "refiller")
        {
            roleRefiller.run(creep);
        }
        else if(creep.memory.role == "storagelink")
        {
            roleStorageLink.run(creep);
        }
        else if(creep.memory.role == "scout")
        {
            roleScout.run(creep);
        }
    }
}