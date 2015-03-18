(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .factory('deliverablesService', deliverablesService);

    /**
     * @ngdoc service
     * @name deliverablesService
     * @description
     *
     */
    function deliverablesService(_, $q, deliverablesModel, deliverableDefinitionsModel) {

        var service = {
            createDeliverableSummaryObject: createDeliverableSummaryObject,
            getGroupedFyDeliverablesByTaskNumber: getGroupedFyDeliverablesByTaskNumber,
            groupDeliverablesByTaskNumber: groupDeliverablesByTaskNumber,
            identifyOutstandingDefinitionsForMonth: identifyOutstandingDefinitionsForMonth
        };

        return service;

        /**==================PRIVATE==================*/


        /**
         * @name deliverablesService.getGroupedFyDeliverablesByTaskNumber
         * @param {number} fiscalYear Fiscal Year (October - September)
         * @returns {promise} Promise which resolves with an object with keys of deliverable task number and
         * values being an array of deliverables for that task number.
         */
        function getGroupedFyDeliverablesByTaskNumber(fiscalYear) {
            var deferred = $q.defer();
            /** Need to ensure definitions are also available although we don't need to reference the returned value */
            $q.all([ deliverablesModel.getFyDeliverables(fiscalYear),
                deliverableDefinitionsModel.getFyDefinitions(fiscalYear)])
                .then(function (resolvedPromises) {
                    var deliverables = resolvedPromises[0];
                    var groupedDeliverables = groupDeliverablesByTaskNumber(deliverables);
                    deferred.resolve(groupedDeliverables);
                });
            return deferred.promise;
        }

        /**
         * @name deliverablesService.groupDeliverablesByTaskNumber
         * @description Grouping method that groups by task number.  Assumes deliverable definitions are already
         * cached so we can make method synchronous
         * @param {Object|Array} deliverables
         * @returns Object with keys of deliverable task number and values being an array of deliverables
         * for that task number
         * @example
         * //Output
         *  {
         *      '3.1': [Deliverable1, Deliverable2...],
         *      '3.3': [Deliverable9, Deliverable14, ...]
         *  }
         */
        function groupDeliverablesByTaskNumber(deliverables) {
            /** Object with keys of deliverable task number and values being an array of deliverables for that task number */
            var groupedDeliverablesByTaskNumber = {};

            /** Add each deliverable to the applicable array */
            _.each(deliverables, function(deliverable) {
                var definition = deliverable.getDeliverableDefinition();
                if(definition && definition.taskNumber) {
                    groupedDeliverablesByTaskNumber[definition.taskNumber] =
                        groupedDeliverablesByTaskNumber[definition.taskNumber] || [];
                    groupedDeliverablesByTaskNumber[definition.taskNumber].push(deliverable);
                }
            });

            return groupedDeliverablesByTaskNumber;
        }

        /**
         * @name deliverablesService.identifyOutstandingDefinitionsForMonth
         * @param {Object|Array} fiscalMonthDeliverables
         * @param {Object|Array} fiscalMonthDefinitions
         * @returns {DeliverableDefinition[]}  Array of all outstanding deliverables for a month.
         */
        function identifyOutstandingDefinitionsForMonth(fiscalMonthDeliverables, fiscalMonthDefinitions) {
            /** Create object with keys equal to the deliverable type id of submitted deliverable */
            var deliverablesIndexedByTypeId = _.indexBy(fiscalMonthDeliverables, function(deliverable) {
                return deliverable.deliverableType.lookupId;
            });

            /** Find definitions with an ID that isn't found in the index above */
            var outstandingDefinitions = [];
            _.each(fiscalMonthDefinitions, function(definition) {
                if(!deliverablesIndexedByTypeId[definition.id]) {
                    outstandingDefinitions.push(definition);
                }
            });
            return outstandingDefinitions;
        }

        function createDeliverableSummaryObject(fyDefinitions) {
            console.time("Summary");
            var summaryObject = {
                onTimePercentage: null,
                onTimeCount: 0,
                notOnTimeCount: 0,
                qualityPercentage: null,
                acceptableCount: 0,
                unacceptableCount: 0,
                anticipatedCount: 0,
                actualCount: 0
            };

            _.each(fyDefinitions, function(definition) {
                summaryObject.onTimeCount += definition.getOnTimeCount();
                summaryObject.notOnTimeCount += definition.getLateCount();
                summaryObject.anticipatedCount += definition.getExpectedDeliverableCount();
                summaryObject.actualCount += _.toArray(definition.getDeliverablesForDefinition()).length;
            });

            summaryObject.onTimePercentage = Math.round(summaryObject.onTimeCount / (summaryObject.onTimeCount + summaryObject.notOnTimeCount) *1000) /1000;
            console.timeEnd("Summary");
            return summaryObject;
        }


    }
})();
