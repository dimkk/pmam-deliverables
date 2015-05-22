/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';


    var service:DeliverablesService;

    interface ISummaryObject{
        acceptableCount: number;
        actualCount: number;
        anticipatedCount: number;
        notOnTimeCount: number;
        onTimeCount: number;
        onTimePercentage?: number;
        qualityPercentage?: number;
        unacceptableCount: number;
    }


    /**
     * @ngdoc service
     * @name deliverablesService
     * @description
     *
     */
    export class DeliverablesService {
        constructor(private $q, private deliverablesModel, private deliverableDefinitionsModel) {
            service = this;
        }

        createDeliverableSummaryObject(fyDefinitions:DeliverableDefinition[]):ISummaryObject {
            var summaryObject = {
                acceptableCount: 0,
                actualCount: 0,
                anticipatedCount: 0,
                notOnTimeCount: 0,
                onTimeCount: 0,
                onTimePercentage: null,
                qualityPercentage: null,
                unacceptableCount: 0
            };

            _.each(fyDefinitions, function (definition) {
                summaryObject.onTimeCount += definition.getOnTimeCount();
                summaryObject.notOnTimeCount += definition.getLateCount();
                summaryObject.anticipatedCount += definition.getExpectedDeliverableCount();
                summaryObject.actualCount += _.toArray(definition.getDeliverablesForDefinition()).length;
                
                summaryObject.acceptableCount += definition.getAcceptableCount();
                summaryObject.unacceptableCount += definition.getUnacceptableCount();
            });

            summaryObject.onTimePercentage = Math.round(summaryObject.onTimeCount / (summaryObject.onTimeCount + summaryObject.notOnTimeCount) * 1000) / 1000;
            return summaryObject;
        }



        /**
         * @name deliverablesService.identifyOutstandingDefinitionsForMonth
         * @param {Object|Array} fiscalMonthDeliverables
         * @param {Object|Array} fiscalMonthDefinitions
         * @returns {DeliverableDefinition[]}  Array of all outstanding deliverables for a month.
         */
        identifyOutstandingDefinitionsForMonth(fiscalMonthDeliverables: Deliverable[], fiscalMonthDefinitions: DeliverableDefinition[]) {
            /** Create object with keys equal to the deliverable type id of submitted deliverable */
            var deliverablesIndexedByTypeId = _.indexBy(fiscalMonthDeliverables, function (deliverable) {
                return deliverable.deliverableType.lookupId;
            });

            /** Find definitions with an ID that isn't found in the index above */
            var outstandingDefinitions = [];
            _.each(fiscalMonthDefinitions, function (definition) {
                if (!deliverablesIndexedByTypeId[definition.id]) {
                    outstandingDefinitions.push(definition);
                }
            });
            return outstandingDefinitions;
        }

        /**
         * @name deliverablesService.identifyOutstandingDefinitionsForMonth
         * @param {Object|Array} fiscalMonthDeliverables
         * @param {Object|Array} fiscalMonthDefinitions
         * @returns {DeliverableDefinition[]}  Array of all  deliverables for a month based on available definitions supplied.
         */
        identifyMatchingDeliverablesForMonth(fiscalMonthDeliverables: Deliverable[], fiscalMonthDefinitions: DeliverableDefinition[]) {
            /** Create object with keys equal to the defintion of submitted definition */
            var definitionsIndexedByTypeId = _.indexBy(fiscalMonthDefinitions, function (definition) {
                return definition.id;
            });

            /** Find deliverable with an lookupId that is found in the index above */
            var matchingDeliverables = [];
            _.each(fiscalMonthDeliverables, function (deliverable) {
                if (definitionsIndexedByTypeId[deliverable.deliverableType.lookupId]) {
                    matchingDeliverables.push(deliverable);
                }
            });
            return matchingDeliverables;
        }

        /**
         * @name deliverablesService.identifyOutstandingDefinitionsForMonth
         * @param {Object|Array} selectedDeliverables
         * @param {Object|Array} selectedDefinitions
         * @returns {DeliverableDefinition[]}  Array of all  deliverables that match on the given definition set.
         */
        identifyDeliverablesForDefinitions(selectedDeliverables: Deliverable[], selectedDefinitions: DeliverableDefinition[]) {
            /** Create object with keys equal to the defintion of submitted definition */
            var definitionsIndexedByTypeId = _.indexBy(selectedDefinitions, function (definition) {
                return definition.id;
            });
            
            /** Find deliverable with an lookupId that is found in the index above */
            var matchingDeliverables = [];
            _.each(selectedDeliverables, function (deliverable) {
                if (definitionsIndexedByTypeId[deliverable.deliverableType.lookupId]) {
                    matchingDeliverables.push(deliverable);
                }
            });
            return matchingDeliverables;
        }
    }

    angular
        .module('pmam-deliverables')
        .service('deliverablesService', DeliverablesService);

}
