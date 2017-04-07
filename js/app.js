/*global: MainLoop*/
; (function () {
    'use strict';

    var events = [];
    var state = {
        log: {
            messages: [],
            draw: function () {
                var items = '';
                this.messages.forEach(function (msg) {
                    items += '<li class="text-' + msg.status + '">' + msg.text + '</li>';
                }, this);
                id('log').innerHTML = items;
            }
        },
        backpack: {
            things: {},
            store: function(label) {
                if (!this.things[label]){
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
        dig: {
            left: 0,
            duration: 2000,
            justFinished: false,
            activate: function () {
                this.left = this.duration;
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
                id('dig').disabled = this.isInProgress();
                if (this.isInProgress()) {
                    id('dig-label').textContent = 'Digging';
                    id('dig-bar').style.width = (100 * this.left / this.duration) + '%';
                    id('dig-bar').classList.add('progress-bar-striped');
                    id('dig-bar').textContent = '';
                    id('dig-time').textContent = ' ' + num((1 + this.left) / 1000, 0) + 's';
                }
                if (this.justFinished) {
                    this.justFinished = false;
                    id('dig-label').textContent = 'Dig';
                    id('dig-bar').style.width = '100%';
                    id('dig-bar').classList.remove('progress-bar-striped');
                    id('dig-bar').textContent = 'Dig';
                    var text = '';
                    var status = '';
                    if (Math.floor(Math.random() * 0) == 0) {
                        var messages = [
                            'rock',
                            'log',
                            'twig',
                            'old hat',
                            'brick',
                            ''
                        ];
                        var index = Math.floor(Math.random() * (messages.length - 1));
                        state.backpack.store(messages[index]);
                        text = '<strong>Dug up a ' + messages[index] + '</strong>';
                        status = 'success';
                    }
                    if (text === '') {
                        text = 'Dug in the dirt';
                        status = 'muted';
                    }
                    state.log.messages.push({
                        text: text,
                        status: status
                    });
                }
            }
        },
        update: function (delta) {
            this.dig.update(delta);
        },
        draw: function () {
            this.dig.draw();
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

    function begin() {
        while (events.length > 0) {
            var event = events.shift();
            switch (event) {
                case 'dig':
                    if (!state.dig.isInProgress()) {
                        state.dig.activate()
                    }
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

    id('dig').addEventListener('click', function () {
        events.push('dig');
    });
    id('dig-bar').style.transition = 'width 0s ease 0s';
})();

