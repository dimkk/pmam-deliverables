(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name deliverableDefinitionsModel
     * @model
     * @description
     *
     *
     * @requires apModelFactory
     */
    angular
        .module('pmam-deliverables')
        .factory('deliverableDefinitionsModel', deliverableDefinitionsModel);

    function deliverableDefinitionsModel($q, $modal, _, apModelFactory, $injector, deliverableFrequenciesService,
                                         calendarService) {

        /********************* Model Definition ***************************************/

        /**
         * @ngdoc object
         * @name deliverableDefinitionsModel.model
         * @description
         *  Model Constructor
         */
        var model = apModelFactory.create({
            //Store a promise for each completed fy request so we only need to make the call once
            cachedFyRequests: {},
            factory: DeliverableDefinition,
            getDeliverableDefinitionsForMonth: getDeliverableDefinitionsForMonth,
            getFyDefinitions: getFyDefinitions,
            /**
             * @ngdoc object
             * @name deliverableDefinitionsModel.list
             * @description
             *  Contains
             *
             *  - list.title (Maps to the offline XML file in dev folder (no spaces))
             *  - list.guid (GUID can be found in list properties in SharePoint designer)
             *  - list.customFields
             *  @requires apListFactory
             */
            list: {
                title: 'DeliverableDefinitions',
                /**Maps to the offline XML file in dev folder (no spaces) */
                guid: '{BD9EF99E-8058-4C33-AC11-EFBE04388451}',
                /**List GUID can be found in list properties in SharePoint designer */
                customFields: [
                /** Array of objects mapping each SharePoint field to a property on a list item object */

                /** eg: 'QA Reconciliation of OIS-MC Data' */
                    {
                        staticName: "Title",
                        objectType: "Text",
                        mappedName: "title",
                        readOnly: false,
                        description: 'Label for this deliverable type.'
                    },

                /** eg: 'WUA15-009/2.1.2.b.4.*' */
                    {
                        staticName: "DeliverableNumber",
                        objectType: "Text",
                        mappedName: "deliverableNumber",
                        readOnly: false
                    },

                /** See deliverableFrequenciesService for options */
                    {
                        staticName: 'DeliverableFrequency',
                        objectType: 'Choice',
                        mappedName: 'deliverableFrequency',
                        readOnly: false,
                        description: 'The frequency this deliverable is due.'
                    },

                    //TODO deprecate because we are trying to do too many things with this field, break apart
                /* For Monthly/Bimonthly this is a number as a string that represents the day of the month this deliverable is due
                *  In both of those cases it can also represent the
                * */
                    {
                        staticName: "DateIdentifier",
                        objectType: "Text",
                        mappedName: "dateIdentifier",
                        readOnly: false
                    },


                /** For Monthly/Bimonthly - Represents the day of the month this deliverable is due
                *   ( */
                    {staticName: 'DayOfMonthDue', objectType: 'Integer', mappedName: 'dayOfMonthDue', readOnly: false},

                /** In cases like the last day of the month, there is no easy way to set this using a single integer as
                 * in the above field so we need compute (currently only option is 'LastDayOfMonth' but could be easily expanded) */
                    {
                        staticName: 'DynamicDate',
                        objectType: 'Choice',
                        mappedName: 'dynamicDate',
                        readOnly: false
                    },

                /** In cases where we are given N days from the start date to have the deliverable submitted (ad-hoc deliverables) */
                    {staticName: 'DateOffset', objectType: 'Integer', mappedName: 'dateOffset', readOnly: false},

                /** Applicable FY to display this deliverable type */
                    {staticName: "FY", objectType: "Integer", mappedName: "fy", readOnly: false},

                /** eg: Day 5 of every month. */
                    {
                        staticName: "FrequencyDescription",
                        objectType: "Text",
                        mappedName: "frequencyDescription",
                        readOnly: false
                    },

                    //TODO Allow users to update default to/cc recipients

                /** Default To and CC email recipients.  Accepts both users and groups
                 * (currently uses members from 'ESED Deliverables Participants' group)*/
                    {staticName: 'To', objectType: 'UserMulti', mappedName: 'to', readOnly: false},
                    {staticName: "CC", objectType: "UserMulti", mappedName: "cc", readOnly: false},

                /** Work unit assignment number (eg 2.1 or 2.3) */
                    {staticName: 'TaskNumber', objectType: 'Text', mappedName: 'taskNumber', readOnly: false},

                /** JSON array of date strings ["2014-12-15", "2015-03-15", "2015-06-15", "2015-09-15"] that will override calculated dates. */
                    {staticName: 'SpecifiedDates', objectType: 'JSON', mappedName: 'specifiedDates', readOnly: false}

                ]
            }
        });

        /*********************************** Factory and Methods ***************************************/
        /**
         * @ngdoc function
         * @name deliverableDefinitionsModel.DeliverableDefinition
         * @description
         * Entity Constructor
         * @param {object} obj New entity to extend.
         * @constructor
         */
        function DeliverableDefinition(obj) {
            var self = this;
            _.extend(self, obj);
            /** Identify all due dates for this deliverable definition and store for later use */
            self.dueDates = deliverableFrequenciesService.generateDeliverableDueDates(self);
        }

        DeliverableDefinition.prototype.getAllFeedback = getAllFeedback;
        DeliverableDefinition.prototype.getDeliverableDueDatesForMonth = getDeliverableDueDatesForMonth;
        DeliverableDefinition.prototype.getDeliverablesForDefinition = getDeliverablesForDefinition;
        DeliverableDefinition.prototype.getExpectedDeliverableCount = getExpectedDeliverableCount;
        DeliverableDefinition.prototype.getLateCount = getLateCount;
        DeliverableDefinition.prototype.getOnTimeCount = getOnTimeCount;
        DeliverableDefinition.prototype.stakeholdersModal = stakeholdersModal;


        function stakeholdersModal() {
            var deliverableDefinition = this;
            return $modal.open({
                templateUrl: 'modules/deliverable_definitions/deliverableDefinitionModalView.html',
                controller: 'deliverableDefinitionModalController',
                controllerAs: 'vm',
                resolve: {
                    deliverableDefinition: function () {
                        return deliverableDefinition;
                    }
                }
            });
        }


        /*********************************** Queries ***************************************/

        /**
         * @description Makes a single request for deliverable definitions for a given FY.  All subsequent requests
         * return a cached promise that resolves with the original indexedCache.
         * @param {number|string} fy Fiscal Year
         * @returns {*}
         */
        function getFyDefinitions(fy) {
            /** Unique query name (ex: fy2013) */
            var fyCacheKey = 'fy' + fy;

            /** Make request from server is fy request hasn't already been made */
            if(!model.cachedFyRequests[fy]) {
                /** Register dynamic query with model */
                model.registerQuery({
                    name: fyCacheKey,
                    operation: 'GetListItems',
                    query: '' +
                    '<Query>' +
                    '   <OrderBy>' +
                    '       <FieldRef Name="ID" Ascending="TRUE"/>' +
                    '   </OrderBy>' +
                    '   <Where>' +
                    /** Return all records for this FY */
                    '       <Eq>' +
                    '           <FieldRef Name="FY"/>' +
                    '           <Value Type="Text">' + fy + '</Value>' +
                    '       </Eq>' +
                    '   </Where>' +
                    '</Query>'
                });

                /** Cache promise so we can return for future calls */
                model.cachedFyRequests[fy] = model.executeQuery(fyCacheKey);

            }

            /** Return cached promise */
            return model.cachedFyRequests[fy];
        }

        /**
         * @name deliverableDefinitionsModel.getDeliverableDefinitionsForMonth
         * @description Accepts a fiscal month and year and returns applicable definitions for that period
         * @param {number} fiscalYear Fiscal Year (October - September)
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @returns {object} Keys of definition ID and value of definition.
         */
        function getDeliverableDefinitionsForMonth( fiscalYear, fiscalMonth ) {

            var deferred = $q.defer();

            getFyDefinitions(fiscalYear)
                .then(function( deliverableDefinitions ){
                    var deliverableDefinitionsByMonth = filterDefinitionsForFiscalMonth(fiscalMonth, deliverableDefinitions);
                    deferred.resolve(deliverableDefinitionsByMonth);
                });

            return deferred.promise;
        }


        /**
         * @name deliverableDefinitionsModel.filterDefinitionsForFiscalMonth
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @param {Object|Array} deliverableDefinitions
         * @returns {Object} deliverableDefinitionsByMonth with keys of definition id and value of the definition.
         */
        function filterDefinitionsForFiscalMonth(fiscalMonth, deliverableDefinitions) {
            //Need to get use calendar month instead of fiscal month in order to get due dates for a month
            var calendarMonth = calendarService.getCalendarMonth(fiscalMonth);

            var deliverableDefinitionsByMonth = {};

            _.each(deliverableDefinitions, function( deliverableDefinition ) {

                //Retrieve array of all due dates for this deliverable for the given month
                var dueDatesThisMonth = deliverableDefinition.getDeliverableDueDatesForMonth(calendarMonth);

                if( dueDatesThisMonth.length > 0) {
                    deliverableDefinitionsByMonth[ deliverableDefinition.id ] = deliverableDefinition;
                }

            } );

            return deliverableDefinitionsByMonth;
        }





        /********************* Model Specific Shared Functions ***************************************/

        /**
         * @description Given a zero based month number, returns an array of due dates for the given month or an empty
         * array if there are no due dates for the month.
         * @param {number} zeroBasedMonthNumber Calendar month (0-11) in JS
         * @returns {Date[]}
         */
        function getDeliverableDueDatesForMonth(zeroBasedMonthNumber) {
            var deliverableDefinition = this,
                deliverableDueDatesForMonth = [];
            _.each(deliverableDefinition.dueDates, function (dueDate) {
                if (dueDate.getMonth() == zeroBasedMonthNumber) {
                    deliverableDueDatesForMonth.push(dueDate);
                }
            });
            return deliverableDueDatesForMonth;
        }

        /**
         * @name DeliverableDefinition.getDeliverablesForDefinition
         * @description Allows us to retrieve deliverables for a given definition which have already been
         * grouped/cache by definition id.
         * @returns {object} Keys of deliverable id and values of the deliverables themselves.
         */
        function getDeliverablesForDefinition() {
            var deliverableDefinition = this;
            /* Need to manually inject with $injector because deliverablesModel already has this model as a
             * dependency and they can't each directly depend on the other or neither will instantiate */
            var deliverablesModel = $injector.get('deliverablesModel');
            return deliverablesModel.getCachedDeliverablesByTypeId(deliverableDefinition.id);
        }

        /**
         * @name DeliverableDefinition.getExpectedDeliverableCount
         * @description Returns the number of deliverables that should be in the system for the given definition
         * @returns {Number}
         */
        function getExpectedDeliverableCount() {
            var deliverableDefinition = this;
            var today = new Date();
            var expectedDueDates = [];
            _.each(deliverableDefinition.dueDates, function(date) {
                if(date < today) {
                    expectedDueDates.push(date);
                }
            });
            return expectedDueDates.length;
        }

        /**
         * @name DeliverableDefinition.getLateCount
         * @returns {number} The number of deliverables that are still outstanding or were submitted after the due date
         * up to this point for the fiscal year.
         */
        function getLateCount() {
            var deliverableDefinition = this;
            var deliverablesForDefinition = _.toArray(deliverableDefinition.getDeliverablesForDefinition());

            /** The number of deliverables that still haven't been submitted */
            var missingDeliverableCount = deliverableDefinition.getExpectedDeliverableCount() - deliverablesForDefinition.length;
            /** Don't get extra credit for more deliverables than were supposed to be submitted so ignore negative number */
            var lateCount = missingDeliverableCount < 0 ? 0 : missingDeliverableCount;
            _.each(deliverablesForDefinition, function(deliverable) {
                if(!deliverable.wasDeliveredOnTime()) {
                    lateCount++;
                }
            });
            return lateCount;
        }


        /**
         * @name DeliverableDefinition.getOnTimeCount
         * @returns {number} The number of deliverables that were turned in by or on the due date
         */
        function getOnTimeCount() {
            var deliverableDefinition = this;
            var onTimeCount = 0;
            var deliverablesForDefinition = deliverableDefinition.getDeliverablesForDefinition();
            _.each(deliverablesForDefinition, function(deliverable) {
                if(deliverable.wasDeliveredOnTime()) {
                    onTimeCount++;
                }
            });
            return onTimeCount;
        }

        /**
         * @name DeliverableDefinition.getAllFeedback
         * @returns {Feedback[]} Array containing all feedback for all of the deliverables of this type.
         */
        function getAllFeedback() {
            var deliverableDefinition = this;
            var deliverablesForDefinition = deliverableDefinition.getDeliverablesForDefinition();
            var feedbackForDefinition = [];
            _.each(deliverablesForDefinition, function(deliverable) {
                var feedback = _.toArray(deliverable.getCachedFeedbackByDeliverableId());
                Array.prototype.push.apply(feedbackForDefinition, feedback);
            });
            return feedbackForDefinition;
        }

        return model;

    }
})();
