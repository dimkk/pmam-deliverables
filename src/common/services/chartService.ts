/// <reference path="../../../typings/tsd.d.ts" />

module app {
    'use strict';

    interface IChartService {
        Gauge:IGauge;
        getOnTimeDeliveryPercentage(deliverables:IDeliverable[]):number;
        getOnTimeDeliveryRating(deliverables:IDeliverable[]):number;
        getRandom():number;
        getSatisfactionRating(deliverables:IDeliverable[]):number;
    }

    class chartService implements IChartService {
        constructor(private _:_, public $timeout:ng.ITimeoutService) {

        }

        Gauge = Gauge;

        /**
         * @name chartService.getRandom
         * @description Returns a random value to mock gauges between 0-5.
         * @returns {number}
         */
        getRandom():number {
            return (Math.random() * 5).toFixed(1);
        }

        getOnTimeDeliveryPercentage(deliverables:IDeliverable[]):number {
            var onTimeDeliverables = 0;
            var deliverableArray = _.isArray(deliverables) ? deliverables : _.toArray(deliverables);
            _.each(deliverableArray, function (deliverable) {
                if (deliverable.wasDeliveredOnTime()) {
                    onTimeDeliverables++;
                }
            });
            return onTimeDeliverables / deliverableArray.length;
        }

        getOnTimeDeliveryRating(deliverables:IDeliverable[]):number {
            var percentage = this.getOnTimeDeliveryPercentage(deliverables);
            return parseInt(percentage * 5 * 10) / 10;
        }

        getSatisfactionRating(deliverables:IDeliverable[]):number {
            var ratingSum = 0;
            var deliverableArray = _.isArray(deliverables) ? deliverables : _.toArray(deliverables);
            _.each(deliverableArray, function (deliverable) {
                ratingSum += deliverable.getRatingsAverage();
            });
            return Math.round((ratingSum / deliverableArray.length) * 10) / 10;
        }

    }

    interface IGauge{
        type:string;
        displayed:boolean;
        data:Object;
        options:Object;
        updateGaugeValue(val:number, label?:string):void;
    }

    /**
     * @name chartService.Gauge
     * @param {string} label Gauge label
     * @param {object} [options] Object with properties to override default options.
     * @constructor
     */
    class Gauge implements IGauge{
        type = 'Gauge';
        displayed = true;
        data = {
            cols: [
                {
                    id: 'label',
                    type: 'string'
                },
                {
                    id: 'value',
                    type: 'number'
                }
            ],
            rows: [
                {
                    c: [
                        {v: ''},
                        {v: 0, f: '0'}
                    ]
                }
            ]
        };
        options = {
            animation: {
                duration: 1000,
                easing: 'inAndOut'
            },
            redFrom: 2.5, redTo: 3,
            yellowFrom: 3, yellowTo: 4, yellowColor: '#fbff0a',
            greenFrom: 4, greenTo: 5,
            majorTicks: [0, 1, 2, 3, 4, 5],
            max: 5,
            fontName: '"Arial"',
            fontSize: 10
        };

        constructor(label:string, options?:Object) {
            var self = this;
            self.data.rows[0].c[0].v = label;
            _.extend(self.options, options);

        }

        updateGaugeValue(val:number, label?:string):void {
            var self = this;
            /* Pause prior to triggering animation */
            chartService.$timeout(function () {
                if (isNaN(val)) {
                    self.data.rows[0].c[1].v = 0;
                    self.data.rows[0].c[1].f = 'N/A';
                } else {
                    self.data.rows[0].c[1].v = val;
                    self.data.rows[0].c[1].f = label || val;
                }
            }, 750);
        }
    }

    angular
        .module('pmam-deliverables')
        .service('chartService', chartService);
}
