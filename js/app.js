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
                var job = APP.jobs.find('make');
                if (job && job.count < 1 && !job.available) {
                    job.available = true;
                    $id('actions').innerHTML += '<button class="btn" data-action="make" style="background-image: url(svg/spade.svg)" type="button">Make</button>';
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
                state.work.activate(job);
            }
        }
    });

    $id('fps').addEventListener('click', function () {
        Object.values(APP.items).map(function (item) {
            state.backpack.store(item);
        }, this);
    });
})();
