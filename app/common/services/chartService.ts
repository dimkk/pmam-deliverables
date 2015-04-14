/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';
    // calculates and renders overall metrics into gauges using google charts
    var service:ChartService, $timeout;

    /**
     * @ngdoc service
     * @name chartService
     * @description
     *
     */
    class ChartService {
        Gauge = Gauge;
        constructor(_$timeout_) {
            service = this;
            $timeout = _$timeout_;

        }

        getOnTimeDeliveryPercentage(deliverables:Deliverable[]):number {
            var onTimeDeliverables = 0;
            var deliverableArray = _.isArray(deliverables) ? deliverables : _.toArray(deliverables);
            _.each(deliverableArray, function (deliverable) {
                if (deliverable.wasDeliveredOnTime()) {
                    onTimeDeliverables++;
                }
            });
            return onTimeDeliverables / deliverableArray.length;
        }

        getOnTimeDeliveryRating(deliverables:Deliverable[]):number {
            var percentage = service.getOnTimeDeliveryPercentage(deliverables);
            return parseInt(percentage * 5 * 10) / 10;
        }

        /**
         * @name chartService.getRandom
         * @description Returns a random value to mock gauges between 0-5.
         * @returns {number}
         */
        getRandom():number {
            return (Math.random() * 5).toFixed(1);
        }

        getSatisfactionRating(deliverables:Deliverable[]):number {
            var ratingSum = 0;
            var deliverableArray = _.isArray(deliverables) ? deliverables : _.toArray(deliverables);
            _.each(deliverableArray, function (deliverable) {
                ratingSum += deliverable.getRatingsAverage();
            });
            return Math.round((ratingSum / deliverableArray.length) * 10) / 10;
        }

    }

    /**
     * @name chartService.Gauge
     * @param {string} label Gauge label
     * @param {object} [options] Object with properties to override default options.
     * @constructor
     */
    class Gauge{
        options;
        data:{rows:Array};
        updateGaugeValue:Function;
        constructor(label:string, options?:Object) {
            var self = this;
            _.assign(self, {
                type: 'Gauge',
                displayed: true,
                data: {
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
                                {v: label},
                                {v: 0, 'f': '0'}
                            ]
                        }
                    ]
                },
                options: {
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
                }
            });

            _.assign(self.options, options);

            self.updateGaugeValue = function (val:number, label:string):void {
                /* Pause prior to triggering animation */
                $timeout(function () {
                    if (isNaN(val)) {
                        self.data.rows[0].c[1].v = 0;
                        self.data.rows[0].c[1].f = 'N/A';
                    } else {
                        self.data.rows[0].c[1].v = val;
                        self.data.rows[0].c[1].f = label || val;
                    }
                }, 750);
            };
        }
    }


    angular
        .module('pmam-deliverables')
        .service('chartService', ChartService);

}
