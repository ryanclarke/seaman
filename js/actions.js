/* globals $id */
(function (root, factory) {
    'use strict';

    var actions = {};
 
    root.APP = root.APP || {};
    root.APP.actions = actions;
    factory(actions, root.APP.jobs, root.APP.backpack);
}((typeof window === 'object' && window) || this, function (actions, jobs, backpack) {
    'use strict';

    actions.isDirty = true;

    actions.update = function (delta) {
        jobs.list.forEach(function(job) {
            if (backpack.canAfford(job.requires) && !job.available && (!job.maxCount || job.maxCount >= job.count)) {
                job.available = true;
                actions.isDirty = true;
            } else if (!backpack.canAfford(job.requires) && job.available && (!job.maxCount || job.maxCount < job.count)) {
                job.available = false;
                actions.isDirty = true;
            }
        }, this);
    };

    actions.draw = function () {
        if (actions.isDirty) {
            actions.isDirty = false;
            var buttons = '';
            jobs.list.forEach(function(job){
                buttons += job.available ? job.html : '';
            }, this);
            $id('actions').innerHTML = buttons;
        }
    };
}));
