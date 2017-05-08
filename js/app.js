/* globals APP, MainLoop, $id */
(function () {
    'use strict';

    var events = [];
    var state = {
        lastActionTime: -99999,
        log: APP.log,
        backpack: APP.backpack,
        work: APP.work,
        update: function (delta) {
            this.work.update(delta);
            if (state.backpack.has('twig') && state.backpack.has('string')) {
                var make = APP.jobs.find('craftFishingPole');
                if (make && make.count < 1 && !make.available) {
                    make.available = true;
                    $id('actions').innerHTML += '<button id="job-craft-fishing-pole" class="btn" data-action="craftFishingPole" style="background-image: url(svg/fishing-pole.svg)" type="button">Craft a fishing pole</button>';
                }
            }
            if (state.backpack.has('worm') && state.backpack.has('fishing pole')) {
                var goFish = APP.jobs.find('goFish');
                if (goFish && !goFish.available) {
                    goFish.available = true;
                    $id('actions').innerHTML += '<button class="btn" data-action="goFish" style="background-image: url(svg/fishing.svg)" type="button">Go fishing</button>';
                }
            }
        },
        draw: function () {
            this.work.draw(this.backpack, this.log);
            this.backpack.draw();
            this.log.draw();
        },
    };

    var idleDelay = 5000;
    function begin(timestamp) {
        if (state.work.isInProgress()) {
            state.lastActionTime = timestamp;
            events = [];
        }
        if (events.length === 0 && timestamp - state.lastActionTime > idleDelay) {
            idleDelay *= 2;
            state.lastActionTime = timestamp;
            state.log.store({
                msg: 'Doing nothing',
                value: 0,
            });
        }
        while (events.length > 0 && !state.work.isInProgress()) {
            idleDelay = 10000;
            var event = events.shift();
            if (event) {
                state.work.activate(APP.jobs.find(event));
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
                if (state.backpack.canAfford(job.costs)) {
                    state.backpack.removeCosts(job.costs);
                    state.work.activate(job);
                } else {
                    state.work.activate({
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
            state.backpack.store(item);
        }, this);
    });
})();
