; (function (window) {
    'use strict';
    
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

    // Export to window
    window.APP = window.APP || {};
    window.APP.items = items;
})(window);