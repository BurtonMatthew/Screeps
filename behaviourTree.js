var behaviourTree = 
{
    select: function()
    {
        for (var i = 0, len = arguments.length; i < len; ++i) 
        {
            if(arguments[i]())
                return true;
        }
        return false;
    },

    sequence: function()
    {
        for (var i = 0, len = arguments.length; i < len; ++i) 
        {
            if(!arguments[i]())
                return false;
        }
        return true;
    }
};

module.exports = behaviourTree;