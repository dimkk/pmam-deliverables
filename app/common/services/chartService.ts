/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';
    // calculates and renders overall metrics into gauges using google charts
    var service:ChartService, $timeout, deliverablesService;

    export interface IChartType{
        type:string;
        label:string;
        options?:Object;
    }

    /**
     * @ngdoc service
     * @name chartService
     * @description
     *
     */
    export class ChartService {
        Gauge = Gauge;
        AcceptabilityChart = AcceptabilityChart;
        OnTimeChart = OnTimeChart;
        chartTypes:IChartType[] = [
            {type: 'AreaChart', label: 'Area Chart'},
            {type: 'google.charts.Bar', label: 'Bar Chart', options:{bars:'horizontal'}},
            {type: 'google.charts.Bar', label: 'Column Chart', options:{bars:'vertical'}},
            {type: 'google.charts.Line', label: 'Line'},
            {type: 'Table', label: 'Table'}
        ];

        constructor(_$timeout_, _deliverablesService_) {
            service = this;
            $timeout = _$timeout_;
            deliverablesService = _deliverablesService_;


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
    class Gauge {
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

    //function generateColumnData(deliverableDefinitions:DeliverableDefinition[]):{cols:Object[]; rows:Object[];} {
    //    //var dataArray = [
    //    //    ['Deliverable Type', 'Acceptable', 'Not Rated', 'Unacceptable']
    //    //];
    //    var data = {
    //        cols: [
    //            {label: 'Deliverable Type', type: 'string'},
    //            {label: 'Acceptable', type: 'number'},
    //            {label: 'Not Rated', type: 'number'},
    //            {label: 'Unacceptable', type: 'number'}
    //        ],
    //        rows: []
    //    };
    //    _.each(deliverableDefinitions, function (definition:DeliverableDefinition) {
    //        var row = [{v: definition.title}];
    //        var deliverables = definition.getDeliverablesForDefinition();
    //        var definitionSummary = deliverablesService.createDeliverableSummaryObject([definition]);
    //        row.push({v: definitionSummary.acceptableCount});
    //        row.push({v: definitionSummary.actualCount - (definitionSummary.acceptableCount + definitionSummary.unacceptableCount)});
    //        row.push({v: definitionSummary.unacceptableCount});
    //        data.rows.push({c: row});
    //    });
    //    return data;
    //}
    //
    //function generatePlaceholderData(deliverableDefinitions:DeliverableDefinition[]):{cols:Object[]; rows:Object[];} {
    //    var data = {
    //        cols: [
    //            {label: 'Deliverable Type', type: 'string'},
    //            {label: 'Acceptable', type: 'number'},
    //            {label: 'Not Rated', type: 'number'},
    //            {label: 'Unacceptable', type: 'number'}
    //        ],
    //        rows: []
    //    };
    //
    //    _.each(deliverableDefinitions, function (definition:DeliverableDefinition) {
    //        var row = [{v: definition.title}, {v: 0}, {v: 0}, {v: 0}];
    //        data.rows.push({c: row});
    //    });
    //    return data;
    //}

    /**
     * @name chartService.ColumnChart
     * @param {string} label Label for visualization.
     * @param {DeliverableDefinition[]} deliverableDefinitions Definitions to use for visualization.
     * @param {IChartType} [activeChartType] Object with properties to override default options.
     * @constructor
     */
    class AcceptabilityChart {
        options;
        data:{rows:Object[]; cols:Object[]};
        constructor(label:string, deliverableDefinitions:DeliverableDefinition[], activeChartType?:IChartType) {
            var self = this;
            var data = {
                cols: [
                    {label: 'Deliverable Type', type: 'string'},
                    {label: 'Acceptable', type: 'number'},
                    {label: 'Not Rated', type: 'number'},
                    {label: 'Unacceptable', type: 'number'}
                ],
                rows: []
            };

            _.each(deliverableDefinitions, function (definition:DeliverableDefinition) {
                var row = [{v: definition.title}, {v: 0}, {v: 0}, {v: 0}];
                data.rows.push({c: row});
            });

            _.assign(self, {
                data: data,
                options: {
                    animation: {
                        duration: 1000,
                        easing: 'inAndOut'
                    },
                    isStacked: true,
                    title: label,
                    vAxis: {
                        title: 'Deliverable Qty'
                    }
                }
            }, activeChartType);

            //_.assign(self.options, options);
            /* Pause prior to triggering animation */
            $timeout(function () {
                var activeRowNumber = 0;
                _.each(deliverableDefinitions, function (definition:DeliverableDefinition) {
                    var activeRow = self.data.rows[activeRowNumber].c;
                    var definitionSummary = deliverablesService.createDeliverableSummaryObject([definition]);
                    activeRow[1].v = definitionSummary.acceptableCount;
                    activeRow[2].v = definitionSummary.actualCount - (definitionSummary.acceptableCount + definitionSummary.unacceptableCount);
                    activeRow[3].v = definitionSummary.unacceptableCount;
                    activeRowNumber++;
                });

                //self.data = generateColumnData(deliverableDefinitions);

            }, 750);
        }

    }

    /**
     * @name chartService.ColumnChart
     * @param {string} label Label for visualization.
     * @param {DeliverableDefinition[]} deliverableDefinitions Definitions to use for visualization.
     * @param {IChartType} [activeChartType] Object with properties to override default options.
     * @constructor
     */
    class OnTimeChart {
        options;
        data:{rows:Object[]; cols:Object[]};
        constructor(label:string, deliverableDefinitions:DeliverableDefinition[], activeChartType?:IChartType) {
            var self = this;
            var data = {
                cols: [
                    {label: 'Deliverable Type', type: 'string'},
                    {label: 'On Time', type: 'number'},
                    {label: 'Late', type: 'number'}
                ],
                rows: []
            };

            _.each(deliverableDefinitions, function (definition:DeliverableDefinition) {
                var row = [{v: definition.title}, {v: 0}, {v: 0}];
                data.rows.push({c: row});
            });

            _.assign(self, {
                data: data,
                options: {
                    animation: {
                        duration: 1000,
                        easing: 'inAndOut'
                    },
                    isStacked: true,
                    title: label,
                    vAxis: {
                        title: 'Deliverable Qty'
                    }
                }
            }, activeChartType);

            //_.assign(self.options, options);
            /* Pause prior to triggering animation */
            $timeout(function () {
                var activeRowNumber = 0;
                _.each(deliverableDefinitions, function (definition:DeliverableDefinition) {
                    var activeRow = self.data.rows[activeRowNumber].c;
                    var definitionSummary = deliverablesService.createDeliverableSummaryObject([definition]);
                    activeRow[1].v = definitionSummary.onTimeCount;
                    activeRow[2].v = definitionSummary.actualCount - definitionSummary.onTimeCount;
                    activeRowNumber++;
                });

                //self.data = generateColumnData(deliverableDefinitions);

            }, 750);
        }

    }



    angular
        .module('pmam-deliverables')
        .service('chartService', ChartService);

}
