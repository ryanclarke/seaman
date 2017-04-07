/*global: MainLoop*/
; (function () {
    'use strict';

    var events = [];
    var jobs = [
        {
            action: 'dig',
            count: 0,
            specialCount: 0,
            title: "Digging",
            duration: 2000,
            results: [
                {
                    weight: 50,
                    msg: "Dug in the dirt",
                    item: null,
                    value: 0
                },
                {
                    weight: 10,
                    msg: "Dug up a brick",
                    item: "brick",
                    value: 5
                },
                {
                    weight: 5,
                    msg: "Dug up a old hat",
                    item: "old hat",
                    value: 10
                },
                {
                    weight: 20,
                    msg: "Dug up a rock",
                    item: "rock",
                    value: 1
                },
                {
                    weight: 15,
                    msg: "Dug up a twig",
                    item: "twig",
                    value: 2
                },
            ],
            pickRandomResult: function () {
                var sumOfWeights = this.results.reduce(function (accumulator, result) {
                    return accumulator + result.weight;
                }, 0);
                var roll = Math.floor(Math.random() * sumOfWeights);
                var cumulativeWeight = 0;
                return this.results.find(function (result) {
                    cumulativeWeight += result.weight;
                    return roll < cumulativeWeight;
                });
            },
            getResult: function () {
                this.count += 1;
                if (this.count <= 3) {
                    return this.results[0];
                }

                return this.pickRandomResult();
            }
        },
    ];
    var state = {
        lastActionTime: -99999,
        log: {
            messages: [],
            draw: function () {
                id('log').innerHTML = this.messages.map(function (result) {
                    var text = result.value > 0 ? '<strong>'+result.msg+'</strong>' : result.msg;
                    var status = result.value > 0 ? 'success' : 'muted';
                    return '<li class="text-' + status + '">' + text + '</li>';
                }, this).join('\n');
            }
        },
        backpack: {
            things: {},
            store: function (label) {
                if (!this.things[label]) {
                    this.things[label] = 0;
                }
                this.things[label] += 1;
            },
            draw: function () {
                var items = '';
                Object.keys(this.things).sort().forEach(function (thing) {
                    items += '<li>' + thing + ': ' + this.things[thing] + '</li>';
                }, this);
                id('backpack').innerHTML = items;
            }
        },
        work: {
            left: 0,
            job: null,
            justFinished: false,
            activate: function (newJob) {
                this.job = newJob;
                this.left = this.job.duration;
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
                id('work').disabled = this.isInProgress();
                if (this.isInProgress()) {
                    id('work-label').textContent = this.job.title;
                    id('work-bar').style.width = (100 * this.left / this.job.duration) + '%';
                    id('work-time').textContent = Math.floor(this.left / 1000 + 1) + 's';
                }
                if (this.justFinished) {
                    this.justFinished = false;
                    id('work-label').textContent = 'Doing Nothing';
                    id('work-bar').style.width = '0%';
                    id('work-time').textContent = '';

                    var result = this.job.getResult();
                    state.log.messages.unshift(result);
                    if (result.item) {
                        state.backpack.store(result.item)
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
    }

    function id(id) {
        return document.getElementById(id);
    }

    function num(d, digits) {
        return Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(d);
    }

    function begin(timestamp) {
        if (state.work.isInProgress()) {
            state.lastActionTime = timestamp;
            events = [];
        }
        if (events.length === 0 && timestamp - state.lastActionTime > 10000) {
            state.lastActionTime = timestamp;
            state.log.messages.unshift({
                msg: "Doing nothing",
                value: 0,
            });
        }
        while (events.length > 0 && !state.work.isInProgress()) {
            var event = events.shift();
            switch (event) {
                case 'dig':
                    state.work.activate(jobs.find(function (job) {
                        return job.action === event;
                    }, this));
                    break;

                default:
                    break;
            }
        }
    }

    function update(delta) {
        state.update(delta)
    }

    function draw() {
        state.draw();
    }

    function end(fps, panic) {
        id('fps').textContent = parseInt(fps, 10) + ' FPS';
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

    id('dig-action').addEventListener('click', function () {
        events.push('dig');
    });
    id('work-bar').style.transition = 'width 0s ease 0s';
})();

