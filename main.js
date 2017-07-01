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
        else if(creep.memory.role === 'fighter'|| creep.memory.role === c.ROLE_BUILDER)
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
    }
}