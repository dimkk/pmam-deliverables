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

    export interface IGoogleChartData{
        cols:IGoogleChartColumn[];
        rows:IGoogleChartRow[];
    }


    interface IGoogleChartColumn{
        id?:string;
        label?:string;
        type:string;
    }

    interface IGoogleChartColumnValue{
        v:number;
        f?:string;
    }

    interface IGoogleChartRow {
        c: IGoogleChartColumnValue[]
    }

    /**
     * @ngdoc service
     * @name chartService
     * @description
     *
     */
    export class ChartService {
        Gauge: Gauge;
        AcceptabilityChart: AcceptabilityChart;
        OnTimeChart: OnTimeChart;
        chartTypes:IChartType[] = [
            { type: 'AreaChart', label: 'Area Chart', options: { isStacked: false}},
            { type: 'BarChart', label: 'Bar Chart', options:{bars:'horizontal', height: 350}}, //todo: find a better way to do this!
            { type: 'ColumnChart', label: 'Column Chart', options:{bars:'vertical'}},
            { type: 'LineChart', label: 'Line'},
            {type: 'Table', label: 'Table'}
        ];

        constructor(_$timeout_, _deliverablesService_) {
            service = this;
            $timeout = _$timeout_;
            deliverablesService = _deliverablesService_;

            this.Gauge = Gauge;
            this.AcceptabilityChart = AcceptabilityChart;
            this.OnTimeChart = OnTimeChart;



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

        //getSatisfactionRating(deliverables:Deliverable[]):number {
        //    var ratingSum = 0;
        //    var deliverableArray = _.isArray(deliverables) ? deliverables : _.toArray(deliverables);
        //    _.each(deliverableArray, function (deliverable) {
        //        ratingSum += deliverable.getRatingsAverage();
        //    });
        //    return Math.round((ratingSum / deliverableArray.length) * 10) / 10;
        //}

    }

    /**
     * @name chartService.Gauge
     * @param {string} label Gauge label
     * @param {object} [options] Object with properties to override default options.
     * @constructor
     */
    class Gauge {
        options;
        data:IGoogleChartData;
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

            _.extend(self.options, options);

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

    /**
     * @name chartService.ColumnChart
     * @param {string} label Label for visualization.
     * @param {DeliverableDefinition[]} deliverableDefinitions Definitions to use for visualization.
     * @param {IChartType} [activeChartType] Object with properties to override default options.
     * @param {boolean} [allData] option to restrict data to only categories that have deliverables. Default to true.
     * @constructor
     */
    class AcceptabilityChart {
        options;
        data:IGoogleChartData;
        constructor(label:string, deliverableDefinitions:DeliverableDefinition[], activeChartType?:IChartType, allData?:boolean) {
            var self = this;
            var data:IGoogleChartData = {
                cols: [
                    {label: 'Deliverable Type', type: 'string'},
                    {label: 'Acceptable', type: 'number'},
                    {label: 'Not Rated', type: 'number'},
                    {label: 'Unacceptable', type: 'number'}
                ],
                rows: []
            };

            var availableDefinitions = [];
            var showAllData = (allData !== undefined ? allData  : true);
            
            if (!showAllData) {
                _.each(deliverableDefinitions, function (definition: DeliverableDefinition) {
                    var definitionsWithData = definition.getDeliverablesForDefinition();
                    if (_.toArray(definitionsWithData).length > 0) {
                        availableDefinitions.push(definition);
                    }
                });
            }
            else {
                availableDefinitions = deliverableDefinitions;
            }
            

            //TODO: confirm that its ok to only show categories that have deliverables
            _.each(availableDefinitions, function (definition: DeliverableDefinition) {
                var row = [{ v: definition.title }, { v: 0 }, { v: 0 }, { v: 0 }];
                    data.rows.push({ c: row , id: definition.id}); //added id for drilldown
            });


            _.assign(self, activeChartType, {
                data: data,
                options: {
                    animation: {
                        duration: 1000,
                        easing: 'inAndOut'
                    },
                    colors:['#0F9D58', '#F4B400', '#DB4437'],
                    isStacked: true,
                    subtitle: 'FY Acceptability Summary',
                    title: label,
                    vAxis: {
                        title: 'Deliverable Qty'
                    }
                }

            });

            /* Pause prior to triggering animation */
            $timeout(function () {
                var activeRowNumber = 0;
                _.each(availableDefinitions, function (definition: DeliverableDefinition) {
                        var activeRow = self.data.rows[activeRowNumber].c;
                        var definitionSummary = deliverablesService.createDeliverableSummaryObject([definition]);
                        activeRow[1].v = definitionSummary.acceptableCount;
                        activeRow[2].v = definitionSummary.actualCount - (definitionSummary.acceptableCount + definitionSummary.unacceptableCount);
                        activeRow[3].v = definitionSummary.unacceptableCount;
                        activeRowNumber++;
                });
            }, 750);
        }
    }

    /**
     * @name chartService.ColumnChart
     * @param {string} label Label for visualization.
     * @param {DeliverableDefinition[]} deliverableDefinitions Definitions to use for visualization.
     * @param {IChartType} [activeChartType] Object with properties to override default options.
     * @param {boolean} [allData] option to restrict data to only categories that have deliverables. Default to true.
     * @constructor
     */
    class OnTimeChart {
        options;
        data:IGoogleChartData;
        constructor(label:string, deliverableDefinitions:DeliverableDefinition[], activeChartType?:IChartType,allData?:boolean) {
            var self = this;
            var data = {
                cols: [
                    {label: 'Deliverable Type', type: 'string'},
                    {label: 'On Time', type: 'number'},
                    {label: 'Late', type: 'number'}
                ],
                rows: []
            };

            var availableDefinitions = [];
            var showAllData = (allData !== undefined ? allData : true);
            if (!showAllData) {
                _.each(deliverableDefinitions, function (definition: DeliverableDefinition) {
                    var x = definition.getDeliverablesForDefinition();
                    if (_.toArray(x).length > 0) {
                        availableDefinitions.push(definition);
                    }
                });
            }
            else {
                availableDefinitions = deliverableDefinitions;
            }

            _.each(availableDefinitions, function (definition:DeliverableDefinition) {
                var row = [{v: definition.title}, {v: 0}, {v: 0}];
                data.rows.push({c: row, id: definition.id});
            });

            _.extend(this, activeChartType, {
                data: data,
                options: {
                    animation: {
                        duration: 1000,
                        easing: 'inAndOut'
                    },
                    colors:['#0F9D58', '#DB4437'],
                    isStacked: true,
                    subtitle:'FY On Time Delivery Summary',
                    title: label,
                    vAxis: {
                        title: 'Deliverable Qty'
                    }
                }
            });

                /* Pause prior to triggering animation */
            $timeout(function () {
                var activeRowNumber = 0;
                _.each(availableDefinitions, function (definition:DeliverableDefinition) {
                    var activeRow = self.data.rows[activeRowNumber].c;
                    var definitionSummary = deliverablesService.createDeliverableSummaryObject([definition]);
                    activeRow[1].v = definitionSummary.onTimeCount;
                    activeRow[2].v = definitionSummary.actualCount - definitionSummary.onTimeCount;
                    activeRowNumber++;
                });

            }, 750);

            //self.options.colors = ['#0F9D58', '#BA3B2E'];
            
        }
    }

    angular
        .module('pmam-deliverables')
        .service('chartService', ChartService);

}
