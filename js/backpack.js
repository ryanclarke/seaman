/* globals $id */
; (function (window) {
    'use strict';

    var backpack = (function () {
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
        })();
    
    // Export to window
    window.APP = window.APP || {};
    window.APP.backpack = backpack;
})(window);
