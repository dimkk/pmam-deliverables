(function () {
    'use strict';

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
            ComboChart: ComboChart,
            ColumnChart: ColumnChart,
            GaugeChart: GaugeChart
        };

        return service;



        /**==================PRIVATE==================*/


        function GaugeChart (options) {
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

        function ColumnChart (options) {
            var chart = this;

            var defaults = {
                'type': 'ColumnChart',
                'displayed': true,
                'cssStyle': 'height:300px; width:100%;',
                'data': {
                    'cols': [],
                    'rows': []
                },
                'options': {
                    animation: {
                        duration: 500
                    },
                    colors: palette,
                    focusTarget: 'category',
                    vAxis: {
                        title: 'Health',
                        minValue: 0,
                        maxValue: 5,
                        gridlines: {
                            count: 3
                        },
                        minorGridlines: {
                            count: 1,
                            color: '#CCC'
                        },
                        viewWindowMode: 'pretty'
                    },
                    hAxis: {
                        title: 'Actions'

                    },
                    seriesType: 'bars',
                    chartArea: {
                        left: 60,
                        top: 20,
                        width: '80%',
                        height: '90%'
                    },
                    fontName: '"Georgia"',
                    fontSize: 14
                },
                'formatters': {},
                'view': {}
            };
            //Deep merge
            jQuery.extend(true, chart, options, defaults);
            return chart;
        }

        function ComboChart (options) {
            var chart = this;

            var defaults = {
                'type': 'ComboChart',
                'displayed': true,
                'cssStyle': 'height:400px; width:100%;',
                'data': {
                    'cols': [],
                    'rows': []
                },
                'options': {
                    animation: {
                        duration: 500
                    },
                    colors: palette,
                    focusTarget: 'category',
                    vAxis: {
                        title: 'Actions',
                        minValue: 0,
                        maxValue: 5,
                        gridlines: {
                            count: 3
                        },
                        minorGridlines: {
                            count: 1,
                            color: '#CCC'
                        },
                        viewWindowMode: 'pretty'
                    },
                    seriesType: 'bars',
                    chartArea: {
                        left: 90,
                        top: 20,
                        width: '75%',
                        height: '90%'
                    },
                    fontName: '"Georgia"',
                    fontSize: 14
                },
                'formatters': {},
                'view': {}
            };
            //Deep merge
            jQuery.extend(true, chart, options, defaults);
            return chart;
        }


    }
})();
