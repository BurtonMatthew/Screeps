var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleFighter = require('role.fighter');
var roleMaintenance = require('role.maintenance');
var roleExplorer = require('role.explorer');
var roleStaticHarvester = require('role.staticHarvester');
var roleExpander = require('role.expander');
var roleTruck = require('role.truck');
var roleHarasser = require('role.harasser');
var roleHauler = require('role.hauler');
var roleRefiller = require('role.refiller');
var roleStorageLink = require('role.storageLink');
var roomExpansion = require('room.expansion');

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
        roomExpansion.run(room);
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
    }
}