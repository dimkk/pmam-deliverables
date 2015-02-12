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

    function deliverableDefinitionsModel($modal, _, apModelFactory, $injector, deliverableFrequenciesService) {

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

        DeliverableDefinition.prototype.getDeliverableDueDatesForMonth = getDeliverableDueDatesForMonth;
        DeliverableDefinition.prototype.getDeliverablesForDefinition = getDeliverablesForDefinition;
        DeliverableDefinition.prototype.stakeholdersModal = stakeholdersModal;


        function stakeholdersModal() {
            var deliverableDefinition = this;
            return $modal.open({
                templateUrl: 'modules/deliverables/views/deliverableDefinitionModalView.html',
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
            var self = this;
            /* Need to manually inject with $injector because deliverablesModel already has this model as a
             * dependency and they can't each directly depend on the other or neither will instantiate */
            var deliverablesModel = $injector.get('deliverablesModel');
            return deliverablesModel.getCachedDeliverablesByTypeId(self.id);
        }

        return model;

    }
})();
