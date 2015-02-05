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
            getRandom: getRandom
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
                    redFrom: 0, redTo: 1,
                    yellowFrom: 1, yellowTo: 3, yellowColor: '#fbff0a',
                    greenFrom: 3, greenTo: 5,
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

    }
})();
