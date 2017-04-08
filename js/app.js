/* globals APP, MainLoop, $id */
; (function () {
    'use strict';

    var events = [];
    var state = {
        lastActionTime: -99999,
        log: {
            dirty: false,
            messages: [],
            store: function (message) {
                this.messages.unshift(message);
                this.dirty = true;
            },
            draw: function () {
                if (this.dirty) {
                    this.dirty = false;
                    $id('log').innerHTML = this.messages.map(function (result) {
                        var text = result.item && result.item.value > 0 ? '<strong>' + result.msg + '</strong>' : result.msg;
                        var status = result.item && result.item.value > 0 ? 'success' : 'muted';
                        return '<li class="text-' + status + '">' + text + '</li>';
                    }, this).join('\n');
                }
            }
        },
        backpack: {
            dirty: false,
            things: {},
            store: function (thing) {
                if (!this.things[thing.name]) {
                    this.things[thing.name] = thing;
                    thing.count = 0;
                }
                thing.count += 1;
                this.dirty = true;
            },
            draw: function () {
                if (this.dirty) {
                    this.dirty = false;
                    var tableRows = Object.values(this.things).map(function (thing) {
                        return '<tr><td><img class="img-responsive" src="svg/' + thing.svg + '.svg"></td><td>' + thing.name + '</td><td>' + thing.count + '</td></tr>';
                    }, this);
                    if (tableRows.length > 0) {
                        tableRows.unshift('<tr><th></th><th>Item</th><th>Amount</th><tr>');
                    }
                    $id('backpack').innerHTML = tableRows.join('\n');
                }
            }
        },
        work: {
            left: 0,
            job: null,
            justFinished: false,
            activate: function (newJob) {
                if (!this.isInProgress()) {
                    this.job = newJob;
                    this.left = this.job.duration;
                }
            },
            isInProgress: function () {
                return this.left > 0;
            },
            update: function (delta) {
                if (this.isInProgress()) {
                    this.left -= delta;
                    if (this.left < 0) {
                        this.left = 0;
                        this.justFinished = true;
                    }
                }
            },
            draw: function () {
                $id('work').disabled = this.isInProgress();
                if (this.isInProgress()) {
                    var percent = 100 * this.left / this.job.duration;
                    $id('work-label').textContent = this.job.title;
                    $id('work-bar').style.width = percent + '%';
                    if (percent > 90) {
                        $id('work-time-in').textContent = Math.floor(this.left / 1000 + 1) + 's';
                        $id('work-time-out').textContent = '';
                    } else {
                        $id('work-time-in').textContent = '';
                        $id('work-time-out').textContent = Math.floor(this.left / 1000 + 1) + 's';
                    }
                }
                if (this.justFinished) {
                    this.justFinished = false;
                    $id('work-label').textContent = 'Doing Nothing';
                    $id('work-bar').style.width = '0%';
                    $id('work-time-in').textContent = '';
                    $id('work-time-out').textContent = '';

                    var result = this.job.getResult();
                    state.log.store(result);
                    if (result.item) {
                        state.backpack.store(result.item);
                    }
                    this.job = null;
                }
            }
        },
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
        var inventory = state.backpack.things;
        if (inventory.twig && inventory.string) {
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
