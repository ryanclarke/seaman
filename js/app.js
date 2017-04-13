/* globals APP, MainLoop, $id */
; (function () {
    'use strict';

    var events = [];
    var state = {
        lastActionTime: -99999,
        log: APP.log,
        backpack: (function () {
            var dirty = false;
            var items = {};
            return {
                has: function (itemName) {
                    return items[itemName];
                },
                store: function (item) {
                    if (!items[item.name]) {
                        items[item.name] = item;
                        item.count = 0;
                    }
                    item.count += 1;
                    dirty = true;
                },
                draw: function () {
                    if (dirty) {
                        dirty = false;
                        var tableRows = Object.values(items).map(function (item) {
                            return '<tr><td><img class="img-responsive" src="svg/' + item.svg + '.svg"></td><td>' + item.name + '</td><td>' + item.count + '</td></tr>';
                        }, this);
                        if (tableRows.length > 0) {
                            tableRows.unshift('<tr><th></th><th>Item</th><th>Amount</th><tr>');
                        }
                        $id('backpack').innerHTML = tableRows.join('\n');
                    }
                }
            };
        })(),
        work: (function () {
            var left = 0;
            var job = null;
            var justFinished = false;
            return {
                activate: function (newJob) {
                    if (!this.isInProgress()) {
                        job = newJob;
                        left = job.duration;
                    }
                },
                isInProgress: function () {
                    return left > 0;
                },
                update: function (delta) {
                    if (this.isInProgress()) {
                        left -= delta;
                        if (left < 0) {
                            left = 0;
                            justFinished = true;
                        }
                    }
                },
                draw: function () {
                    $id('work').disabled = this.isInProgress();
                    if (this.isInProgress()) {
                        var percent = 100 * left / job.duration;
                        $id('work-label').textContent = job.title;
                        $id('work-bar').style.width = percent + '%';
                        if (percent > 90) {
                            $id('work-time-in').textContent = Math.floor(left / 1000 + 1) + 's';
                            $id('work-time-out').textContent = '';
                        } else {
                            $id('work-time-in').textContent = '';
                            $id('work-time-out').textContent = Math.floor(left / 1000 + 1) + 's';
                        }
                    }
                    if (justFinished) {
                        justFinished = false;
                        $id('work-label').textContent = 'Doing Nothing';
                        $id('work-bar').style.width = '0%';
                        $id('work-time-in').textContent = '';
                        $id('work-time-out').textContent = '';

                        var result = job.getResult();
                        state.log.store(result);
                        if (result.item) {
                            state.backpack.store(result.item);
                        }
                        job = null;
                    }
                }
            };
        })(),
        update: function (delta) {
            this.work.update(delta);
        },
        draw: function () {
            this.work.draw();
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
        if (state.backpack.has('twig') && state.backpack.has('string')) {
            var job = APP.jobs.find('make');
            if (job && job.count < 1 && !job.available) {
                job.available = true;
                $id('actions').innerHTML += '<button class="btn" data-action="make" style="background-image: url(svg/spade.svg)" type="button">Make</button>';
            }
        }
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
