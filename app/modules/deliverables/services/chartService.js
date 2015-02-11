(function () {
    'use strict';

    // calculates and renders overall metrics into gauges using google charts

    angular
        .module('pmam-deliverables')
        .factory('chartService', chartService);

    /**
     * @ngdoc service
     * @name chartService
     * @description
     *
     */
    function chartService($timeout) {

        var service = {
            Gauge: Gauge,
            getOnTimeDeliveryPercentage: getOnTimeDeliveryPercentage,
            getOnTimeDeliveryRating: getOnTimeDeliveryRating,
            getRandom: getRandom,
            getSatisfactionRating: getSatisfactionRating
        };

        return service;


        /**==================PRIVATE==================*/

        /**
         * @name chartService.Gauge
         * @param {string} label Gauge label
         * @param {object} [options] Object with properties to override default options.
         * @constructor
         */
        function Gauge(label, options) {
            var self = this;
            _.extend(self, {
                'type': 'Gauge',
                'displayed': true,
                'data': {
                    'cols': [
                        {
                            'id': 'label',
                            'type': 'string'
                        },
                        {
                            'id': 'value',
                            'type': 'number'
                        }
                    ],
                    'rows': [
                        {
                            'c': [
                                {'v': label},
                                {'v': 0, 'f': '0'}
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

            _.extend(self.options, options);

            self.updateGaugeValue = function (val) {
                /* Pause prior to triggering animation */
                $timeout(function () {
                    self.data.rows[0].c[1].v = val;
                    self.data.rows[0].c[1].f = val;
                }, 750);
            };
        }

        /**
         * @name chartService.getRandom
         * @description Returns a random value to mock gauges between 0-5.
         * @returns {number}
         */
        function getRandom() {
            return (Math.random() * 5).toFixed(1);
        }

        function getOnTimeDeliveryPercentage(deliverables) {
            var onTimeDeliverables = 0;
            var deliverableArray = _.isArray(deliverables) ? deliverables : _.toArray(deliverables);
            _.each(deliverableArray, function(deliverable) {
                if(deliverable.wasDeliveredOnTime()) {
                    onTimeDeliverables++;
                }
            });
            return onTimeDeliverables / deliverableArray.length;
        }

        function getOnTimeDeliveryRating(deliverables) {
            var percentage = getOnTimeDeliveryPercentage(deliverables);
            var rating = parseInt(percentage * 5 * 10) / 10;
            return rating;
        }

        function getSatisfactionRating(deliverables) {
            var ratingSum = 0;
            var deliverableArray = _.isArray(deliverables) ? deliverables : _.toArray(deliverables);
            _.each(deliverableArray, function(deliverable) {
                ratingSum += deliverable.getRatingsAverage();
            });
            return Math.round( (ratingSum / deliverableArray.length) * 10) / 10;
        }

    }
})();
