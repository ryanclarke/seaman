/* globals APP, $id, $rand */
(function (window) {
    'use strict';

    var items = APP.items;
    var jobs = [
        {
            action: 'daydream',
            duration: 10000,
            available: true,
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
                    msg: $rand(this.results)
                };
            }
        },
        {
            action: 'make',
            count: 0,
            available: false,
            title: 'Crafting a fishing pole',
            duration: 5000,
            getResult: function () {
                this.count += 1;
                $id('actions').querySelector('button:last-child').remove();
                return {
                    msg: 'Created a really nice fishing pole',
                    item: items.fishingPole
                };
            }
        },
        {
            action: 'dig',
            count: 0,
            specialCount: 0,
            available: true,
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

    var finder = function(title) {
        return function(job) {
            return job.action === title;
        };
    };

    var obj = {
        find: function(title) {
            return jobs.find(finder(title));
        }
    };

    // Export to window
    window.APP = window.APP || {};
    window.APP.jobs = obj;
})(window);
