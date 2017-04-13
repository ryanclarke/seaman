/* globals $id */
; (function (window) {
    'use strict';

    var log = (function () {
            var dirty = false;
            var messages = [];
            return {
                store: function (message) {
                    messages.unshift(message);
                    dirty = true;
                },
                draw: function () {
                    if (dirty) {
                        dirty = false;
                        $id('log').innerHTML = messages.map(function (result) {
                            var text = result.item && result.item.value > 0 ? '<strong>' + result.msg + '</strong>' : result.msg;
                            var status = result.item && result.item.value > 0 ? 'success' : 'muted';
                            return '<li class="text-' + status + '">' + text + '</li>';
                        }, this).join('\n');
                    }
                }
            };
    })();
    
    // Export to window
    window.APP = window.APP || {};
    window.APP.log = log;
})(window);
