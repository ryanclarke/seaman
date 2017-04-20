(function(window){
    'use strict';

    window.$id = function(id) {
        return document.getElementById(id);
    };

    window.$rand = function(choices) {
        return choices[Math.floor(Math.random() * choices.length)];
    };

    window.$num = function(d, digits) {
        return Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(d);
    };
})(window);