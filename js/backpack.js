/* globals $id */
(function (window) {
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
                        items[item.name].count = 0;
                    }
                    items[item.name].count += 1;
                    dirty = true;
                },
                canAfford: function (costs) {
                    return costs.every(function(cost) {
                        var item = items[cost.name];
                        return item && item.count >= cost.amount;
                    }, this);
                },
                removeCosts: function (costs) {
                    for (var i=0, l=costs.length; i<l; i+=1) {
                        var cost = costs[i];
                        var item = items[cost.name];
                        if (item) {
                            item.count -= cost.amount;
                            if (item.count <= 0) {
                                delete items[item.name];
                            }
                            dirty = true;
                        }
                    }
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
