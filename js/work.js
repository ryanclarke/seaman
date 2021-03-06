/* globals $id */
(function (window) {
    'use strict';

    var work = (function () {
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
            update: function (delta, handler) {
                if (this.isInProgress()) {
                    left -= delta;
                    if (left < 0) {
                        left = 0;
                        justFinished = true;

                        var result = job.getResult();
                        handler(result);
                        job = null;
                    }
                }
            },
            draw: function () {
                $id('work').disabled = this.isInProgress();
                if (this.isInProgress()) {
                    var percent = 100 * left / job.duration;
                    $id('work-label').textContent = job.progressDescription;
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
                }
            }
        };
    })();

    // Export to window
    window.APP = window.APP || {};
    window.APP.work = work;
})(window);
