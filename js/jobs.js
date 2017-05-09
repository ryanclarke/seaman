/* globals APP, $rand */
(function (window) {
    'use strict';

    var items = APP.items;
    var jobs = [
        {
            action: 'daydream',
            duration: 10000,
            available: true,
            title: 'Daydreaming',
            requires: [],
            costs: [],
            results: [
                'Saw a cloud that looked like a sheep',
                'Saw a cloud that like a wee little lamb',
                'Thought about owning a pony',
                'Heard a sound like a sleeping baby',
                'Picked some flowers',
                'Pretended to see a real princess',
                'Twirled around and around',
            ],
            html: '<button class="btn" data-action="daydream" style="background-image: url(svg/sun-cloud.svg)" type="button">Daydream</button>',
            getResult: function () {
                return {
                    msg: $rand(this.results)
                };
            }
        },
        {
            action: 'craftFishingPole',
            count: 0,
            maxCount: 1,
            available: false,
            title: 'Crafting a fishing pole',
            duration: 5000,
            requires: [
                {
                    name: 'twig',
                    amount: 1
                },
                {
                    name: 'string',
                    amount: 1
                }
            ],
            costs: [
                {
                    name: 'twig',
                    amount: 1
                },
                {
                    name: 'string',
                    amount: 1
                }
            ],
            html: '<button id="job-craft-fishing-pole" class="btn" data-action="craftFishingPole" style="background-image: url(svg/fishing-pole.svg)" type="button">Craft a fishing pole</button>',
            getResult: function () {
                this.count += 1;
                this.available = false;
                return {
                    msg: 'Created a really nice fishing pole',
                    item: items.fishingPole
                };
            }
        },
        {
            action: 'goFish',
            available: false,
            title: 'Doing a bit of fishing',
            duration: 10000,
            requires: [
                {
                    name: 'fishing pole',
                    amount: 1
                },
                {
                    name: 'worm',
                    amount: 1
                }
            ],
            costs: [
                {
                    name: 'worm',
                    amount: 1
                }
            ],
            html: '<button class="btn" data-action="goFish" style="background-image: url(svg/fishing.svg)" type="button">Go fishing</button>',
            getResult: function () {
                return {
                    msg: 'Caught a nice fish',
                    item: items.fish
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
            requires: [],
            costs: [],
            html: '<button class="btn" data-action="dig" style="background-image: url(svg/spade.svg)" type="button">Dig</button>',
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
        },
        list: jobs
    };

    // Export to window
    window.APP = window.APP || {};
    window.APP.jobs = obj;
})(window);
