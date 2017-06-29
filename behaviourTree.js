var behaviourTree = 
{
    FAIL: 0,
    SUCCESS: 1,
    INPROGRESS: 2,

    select: function()
    {
        for (var i = 0, len = arguments.length; i < len; ++i) 
        {
            const nodeResult = arguments[i]();
            if(nodeResult != 0)
                return nodeResult;
        }
        return 0;
    },

    sequence: function()
    {
        for (var i = 0, len = arguments.length; i < len; ++i) 
        {
            const nodeResult = arguments[i]();
            if(nodeResult != 1)
                return nodeResult;
        }
        return 1;
    }
};

module.exports = behaviourTree;