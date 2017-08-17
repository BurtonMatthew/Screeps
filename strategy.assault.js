var utils = require('utils');
let bTree = require('behaviourTree');
let stategyTowerDrain = require('strategy.assault.towerDrain')

function run()
{
    if(!Memory.assaultPlans)
        Memory.assaultPlans = {};

    stategyTowerDrain.registerConsoleCommands();

    for(plan in Memory.assaultPlans)
    {
        var finished = false;
        switch(Memory.assaultPlans[plan].type)
        {
            case 0:
                finished = stategyTowerDrain.run(Memory.assaultPlans[plan]);
                break;
            default:
                delete Memory.assaultPlans[plan];
                break;
        }

        if(finished)
            delete Memory.assaultPlans[plan];
    }
}


module.exports = {
    run
};