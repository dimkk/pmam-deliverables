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
    function deliverablesService(_, $q, deliverablesModel, deliverableDefinitionsModel, calendarService) {

        var service = {
            getDeliverablesForMonth: getDeliverablesForMonth,
            getDeliverableDefinitionsForMonth: getDeliverableDefinitionsForMonth
        };

        return service;

        /**==================PRIVATE==================*/


        /**
         * @name deliverablesService.getDeliverableDefinitionsForMonth
         * @description Accepts a fiscal month and year and returns applicable definitions for that period
         * @param {number} fiscalYear Fiscal Year (October - September)
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @returns {object} Keys of definition ID and value of definition.
         */
        function getDeliverableDefinitionsForMonth( fiscalYear, fiscalMonth ) {

            var deferred = $q.defer();

            //Need to get use calendar month instead of fiscal month in order to get due dates for a month
            var calendarMonth = calendarService.getCalendarMonth(fiscalMonth);


            deliverableDefinitionsModel.getFyDefinitions(fiscalYear)
                .then(function( deliverableDefinitions ){

                    var deliverableDefinitionsByMonth = {};

                    _.each(deliverableDefinitions, function( deliverableDefinition ) {


                        //Retrieve array of all due dates for this deliverable for the given month
                        var dueDatesThisMonth = deliverableDefinition.getDeliverableDueDatesForMonth(calendarMonth);

                        if( dueDatesThisMonth.length > 0) {
                            deliverableDefinitionsByMonth[ deliverableDefinition.id ] = deliverableDefinition;
                        }

                    } );

                    deferred.resolve(deliverableDefinitionsByMonth);
                });

            return deferred.promise;
        }

        /**
         * @name deliverablesService.getDeliverablesForMonth
         * @param {number} fiscalYear Fiscal Year (October - September)
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @returns {promise} object[]
         */
        function getDeliverablesForMonth( fiscalYear, fiscalMonth ) {

            var deferred = $q.defer();

            deliverablesModel.getFyDeliverables(fiscalYear)
                .then(function (indexedCache) {
                    var deliverablesForMonth = _.where(indexedCache, function(deliverable) {
                        return deliverable.fiscalMonth === fiscalMonth;
                    });
                    deferred.resolve(deliverablesForMonth);
                });
            return deferred.promise;
        }

    }
})();
