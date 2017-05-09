/* globals APP, MainLoop, $id */
(function () {
    'use strict';

    var events = [];
    var state = {
        lastActionTime: -99999,
        update: function (delta) {
            APP.work.update(delta, APP.backpack, APP.log);
            APP.actions.update(delta);
        },
        draw: function () {
            APP.work.draw();
            APP.backpack.draw();
            APP.actions.draw();
            APP.log.draw();
        },
    };

    var idleDelay = 5000;
    function begin(timestamp) {
        if (APP.work.isInProgress()) {
            state.lastActionTime = timestamp;
            events = [];
        }
        if (events.length === 0 && timestamp - state.lastActionTime > idleDelay) {
            idleDelay *= 2;
            state.lastActionTime = timestamp;
            APP.log.store({
                msg: 'Doing nothing',
                value: 0,
            });
        }
        while (events.length > 0 && !APP.work.isInProgress()) {
            idleDelay = 10000;
            var event = events.shift();
            if (event) {
                APP.work.activate(APP.jobs.find(event));
            }
        }
    }

    function update(delta) {
        state.update(delta);
    }

    function draw() {
        state.draw();
    }

    function end(fps, panic) {
        $id('fps').textContent = parseInt(fps, 10) + ' FPS';
        if (panic) {
            // This pattern introduces non-deterministic behavior, but in this case
            // it's better than the alternative (the application would look like it
            // was running very quickly until the simulation caught up to real
            // time). See the documentation for `MainLoop.setEnd()` for additional
            // explanation.
            var discardedTime = Math.round(MainLoop.resetFrameDelta());
            console.warn('Main loop panicked, probably because the browser tab was put in the background. Discarding ' + discardedTime + 'ms');
        }
    }

    MainLoop.setBegin(begin).setUpdate(update).setDraw(draw).setEnd(end).start();

    $id('actions').addEventListener('click', function (event) {
        if (event && event.target) {
            var job = APP.jobs.find(event.target.dataset.action);
            if (job) {
                if (APP.backpack.canAfford(job.costs)) {
                    APP.backpack.removeCosts(job.costs);
                    APP.work.activate(job);
                } else {
                    APP.work.activate({
                        duration: 1,
                        getResult: function () {
                            return {
                                msg: job.costs.reduce(function (acc, cost) {
                                    return acc + ' ' + cost.amount.toString() + ' ' + cost.name + ',';
                                }, 'Requires').slice(0, -1)
                            };
                        }
                    });
                }
            }
        }
    });

    $id('fps').addEventListener('click', function () {
        Object.values(APP.items).map(function (item) {
            APP.backpack.store(item);
        }, this);
    });
})();
