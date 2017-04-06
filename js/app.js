/*global: MainLoop*/
;(function() {
    'use strict';

    var events = [];
    var logs = [];
    var state = {
        dig: {
            left: 0,
            duration: 2000,
            activate: function() {
                this.left = this.duration;
            },
            isInProgress: function() {
                return this.left > 0;
            },
            update: function(delta) {
                if (this.isInProgress()){
                    this.left -= delta;
                    if (this.left < 0) {
                        this.left = 0;
                    }
                }
            },
            draw: function() {
                id('dig').disabled = this.isInProgress();
            },
        },
        update: function(delta) {
            this.dig.update(delta);
        },
        draw: function() {
            this.dig.draw();
        },
    }

    function id(id) {
        return document.getElementById(id);
    }

    function num(d, digits) {
        return Intl.NumberFormat('en-US', {minimumFractionDigits: digits, maximumFractionDigits: digits}).format(d);
    }

    function begin() {
        while (events.length > 0) {
            var event = events.shift();
            switch (event) {
                case 'dig':
                    if (!state.dig.isInProgress()) {
                        logs.push("Dug in the dirt");
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
        id('log').innerHTML = logs.join("<br>");
        id('number').textContent = num(state.dig.left/1000, 1);
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

    id('dig').addEventListener('click', function() {
        events.push('dig');
    });
})();

