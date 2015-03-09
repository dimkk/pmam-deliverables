module app.services {
    'use strict';

    interface IChartService {
        Gauge: Gauge,
        getOnTimeDeliveryPercentage: getOnTimeDeliveryPercentage,
        getOnTimeDeliveryRating: getOnTimeDeliveryRating,
        getRandom: getRandom,
        getSatisfactionRating: getSatisfactionRating

    }

    class chartService implements IChartService {
        constructor(private _:_, $timeout: ng.ITimeoutService) {

        }
        Gauge: Gauge;

    }

    /**
     * @name chartService.Gauge
     * @param {string} label Gauge label
     * @param {object} [options] Object with properties to override default options.
     * @constructor
     */
    class Gauge{
        constructor(label, options) {
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

        }

        updateGaugeValue (val, label) {
            /* Pause prior to triggering animation */
            $timeout(function () {
                if(isNaN(val)) {
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
