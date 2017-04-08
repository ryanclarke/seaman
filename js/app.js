/*global: MainLoop*/
; (function () {
    'use strict';

    var events = [];
    var items = {
        brick: {
            name: 'brick',
            svg: 'brick-pile',
            value: 5
        },
        rock: {
            name: 'rock',
            svg: 'stone-pile',
            value: 1
        },
        string: {
            name: 'string',
            svg: 'whiplash',
            value: 3
        },
        twig: {
            name: 'twig',
            svg: 'tree-branch',
            value: 2
        },
        worm: {
            name: 'worm',
            svg: 'earth-worm',
            value: 1
        },
        oldHat: {
            name: 'old hat',
            svg: 'fedora',
            value: 10
        },
        pirateHat: {
            name: 'pirate hat',
            svg: 'pirate-hat',
            value: 25
        },
        topHat: {
            name: 'top hat',
            svg: 'top-hat',
            value: 25
        },
        cowboyHat: {
            name: 'cowboy hat',
            svg: 'top-hat',
            value: 25
        },
        sombrero: {
            name: 'sombrero',
            svg: 'sombrero',
            value: 25
        },
        tool: {
            name: 'tool',
            svg: 'spade',
            value: 20
        },
    };
    function rand(choices) {
        return choices[Math.floor(Math.random() * choices.length)];
    }
    var jobs = [
        {
            action: 'daydream',
            duration: 10000,
            title: 'Daydreaming',
            results: [
                'Saw a cloud that looked like a sheep',
                'Saw a cloud that like a wee little lamb',
                'Thought about owning a pony',
                'Heard a sound like a sleeping baby',
                'Picked some flowers',
                'Pretended to see a real princess',
                'Twirled around and around',
            ],
            getResult: function () {
                return {
                    msg: rand(this.results)
                };
            }
        },
        {
            action: 'make',
            count: 0,
            available: false,
            title: 'Making',
            duration: 5000,
            getResult: function () {
                this.count += 1;
                id('actions').querySelector('button:last-child').remove();
                return {
                    msg: 'Made a tool',
                    item: items.tool
                };
            }
        },
        {
            action: 'dig',
            count: 0,
            specialCount: 0,
            title: 'Digging',
            duration: 2000,
            results: [
                {
                    weight: 50,
                    msg: 'Dug in the dirt',
                    item: null
                },
                {
                    weight: 10,
                    msg: 'Dug up a brick',
                    item: items.brick
                },
                {
                    weight: 4,
                    msg: 'Dug up an old hat',
                    item: items.oldHat
                },
                {
                    weight: 1,
                    msg: 'Dug up an old pirate hat',
                    item: items.pirateHat,
                },
                {
                    weight: 1,
                    msg: 'Dug up an old top hat',
                    item: items.topHat,
                },
                {
                    weight: 1,
                    msg: 'Dug up an old cowboy hat',
                    item: items.cowboyHat,
                },
                {
                    weight: 1,
                    msg: 'Dug up an old sombrero',
                    item: items.sombrero,
                },
                {
                    weight: 15,
                    msg: 'Dug up a rock',
                    item: items.rock
                },
                {
                    weight: 10,
                    msg: 'Dug up a piece of string',
                    item: items.string
                },
                {
                    weight: 10,
                    msg: 'Dug up a twig',
                    item: items.twig
                },
                {
                    weight: 15,
                    msg: 'Dug up a wiggly worm',
                    item: items.worm
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
                if (this.count <= 2) {
                    return this.results[0];
                }

                return this.pickRandomResult();
            }
        },
    ];
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
                    id('log').innerHTML = this.messages.map(function (result) {
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
                    id('backpack').innerHTML = tableRows.join('\n');
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
                id('work').disabled = this.isInProgress();
                if (this.isInProgress()) {
                    var percent = 100 * this.left / this.job.duration;
                    id('work-label').textContent = this.job.title;
                    id('work-bar').style.width = percent + '%';
                    if (percent > 90) {
                        id('work-time-in').textContent = Math.floor(this.left / 1000 + 1) + 's';
                        id('work-time-out').textContent = '';
                    } else {
                        id('work-time-in').textContent = '';
                        id('work-time-out').textContent = Math.floor(this.left / 1000 + 1) + 's';
                    }
                }
                if (this.justFinished) {
                    this.justFinished = false;
                    id('work-label').textContent = 'Doing Nothing';
                    id('work-bar').style.width = '0%';
                    id('work-time-in').textContent = '';
                    id('work-time-out').textContent = '';

                    var result = this.job.getResult();
                    state.log.store(result);
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
                msg: "Doing nothing",
                value: 0,
            });
        }
        while (events.length > 0 && !state.work.isInProgress()) {
            idleDelay = 10000;
            var event = events.shift();
            if (event) {
                state.work.activate(jobs.find(function (job) {
                    return job.action === event;
                }, this));
            }
        }
    }

    function update(delta) {
        state.update(delta);
        var inventory = state.backpack.things;
        if (inventory.twig && inventory.string) {
            var job = jobs.find(function(job){
                return job.action === "make";
            });
            if (job && job.count < 1 && !job.available) {
                job.available = true;
                id('actions').innerHTML += '<button class="btn" data-action="make" style="background-image: url(svg/spade.svg)" type="button">Make</button>'
            }
        }
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

    id('actions').addEventListener('click', function (event) {
        if (event && event.target) {
            var job = jobs.find(function (job) {
                return job.action === event.target.dataset.action;
            }, this);
            if (job) {
                state.work.activate(job);
            }
        }
    });

    id('fps').addEventListener('click', function () {
        Object.values(items).map(function (item) {
            state.backpack.store(item);
        }, this);
    })
})();
