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
    function chartService() {
        var palette = ['#667B99', '#a58a5d', '#AB988B', '#A50516', '#904820', '#D4A357',
            '#C0C0C0', '#9C2A00', '#663300'];

        var service = {
            GaugeChart: GaugeChart,
            Gauge: Gauge,
            prepareMetrics: prepareMetrics,
            buildGauges: buildGauges,
            getRandom: getRandom
        };

        var state = {
            displayDate: 'loading',
            selectedDivision: '',
            selectedTeam: '',
            showDivisions: false,
            viewModeMonth: true,
            displayMode: "displayDate",
            title: "Deliverables",
            monthActive: 'active',
            qtrActive: null,
            displayedTitle: '',
            validChartData: false,
            availableMonths: []
        }

        return service;


        /**==================PRIVATE==================*/
        function Gauge(label) {
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
                                {'v': 0, 'f': '0%'}
                            ]
                        }
                    ]
                },
                options: {
                    animation: {
                        duration: 1000,
                        easing: 'inAndOut'
                    },
                    max: 100,
                    fontName: '"Arial"',
                    fontSize: 10,
                    majorTicks: [0, 20, 40, 60, 80, 100]
                }
            });

            self.updateGaugeValue = function (percent) {
                /* Pause prior to triggering animation */
                $timeout(function () {
                    self.data.rows[0].c[1].v = percent;
                    self.data.rows[0].c[1].f = percent + '%';
                }, 1000);
            };
        }

        function GaugeChart(options) {
            var chart = this;

            var defaults = {
                'type': 'Gauge',
                'displayed': true,
                'cssStyle': 'height:300px; width:100%;',
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
                    'rows': []
                },
                'options': {
                    animation: {
                        duration: 500,
                        easing: 'inAndOut'
                    },
                    redFrom: 0, redTo: 1,
                    yellowFrom: 1, yellowTo: 3, yellowColor: '#fbff0a',
                    greenFrom: 3, greenTo: 5,
                    majorTicks: [0, 1, 2, 3, 4, 5],
                    max: 5
                },
                'formatters': {},
                'view': {}
            };
            //Deep merge
            jQuery.extend(true, chart, defaults, options);
            return chart;
        }

        function prepareMetrics(deliverablesByMonth) {
            var metricsByMonth = {};
            //Clear out any monthly data
            state.availableMonths.length = 0;
            //Add references to each metric broken out by date
            _.each(deliverablesByMonth, function (deliverable) {

                //Sets initial date to the most recent display date
                state.displayDate = deliverable.displayDate;

                //Create array to hold metrics for this month if it doesn't exist
                metricsByMonth[deliverable[state.displayMode]] = metricsByMonth[deliverable[state.displayMode]] || []
                metricsByMonth[deliverable[state.displayMode]].push(deliverable);

            });
            _.each(metricsByMonth, function (monthMetrics, monthLabel) {
                state.availableMonths.push(monthLabel);
            });

            state.validChartData = true;
        }

        function buildGauges() {
            //Create initial gauge objects if not already defined
            var Gauge1 = new GaugeChart({
                options: {
                    animation: {
                        easing: 'out',
                        duration: 1000
                    }
                },
                data: {
                    rows: [
                        {
                            "c": [
                                {"v": 'Satisfaction', "p": {}},
                                {"v": 0, "p": {}}
                            ]
                        }
                    ]
                }
            });
            var Gauge2 = new GaugeChart({
                options: {
                    animation: {
                        easing: 'out',
                        duration: 1000
                    }
                },
                data: {
                    rows: [
                        {
                            "c": [
                                {"v": 'OTD', "p": {}},
                                {"v": 0, "p": {}}
                            ]
                        }
                    ]
                }
            });

            var gauges = {
                Gauge1: Gauge1,
                Gauge2: Gauge2
            };

            return gauges;
        }

        function getRandom() {
            return Math.floor(Math.random() * 5) + 1;
        }

    }
})();
