/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="./deliverableFeedbackModel.ts" />
/// <reference path="./deliverablesModel.ts" />
/// <reference path="./DeliverableDefinition.ts" />

module app.models {
    'use strict';

    export interface IDeliverableDefinitionsModel extends ap.Model{
        cachedFyRequests:Object;
        factory:Function;
        getDeliverableDefinitionsForMonth(fiscalYear:number, fiscalMonth:number):ng.IPromise<Object>;
        getFyDefinitions(fy:number):ng.IPromise<ap.IndexedCache>;
        stakeholdersModal():ng.ui.bootstrap.IModalServiceInstance;
        deliverableFrequenciesService:Object;
    }


    export class DeliverableDefinitionsModel implements IDeliverableDefinitionsModel{
        constructor(private $q, private $modal, private _, private apModelFactory, private $injector,
                    public deliverableFrequenciesService, private calendarService) {

            this.factory = app.models.DeliverableDefinition;
            apModelFactory.create(this);
        }

        //Store a promise for each completed fy request so we only need to make the call once
        cachedFyRequests = {};
        factory;

        list = <ap.List>{
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
        };

        /**
         * @name deliverableDefinitionsModel.getDeliverableDefinitionsForMonth
         * @description Accepts a fiscal month and year and returns applicable definitions for that period
         * @param {number} fiscalYear Fiscal Year (October - September)
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @returns {object} Keys of definition ID and value of definition.
         */
        getDeliverableDefinitionsForMonth(fiscalYear:number, fiscalMonth:number):ng.IPromise<Object> {

            var deferred = this.$q.defer();

            this.getFyDefinitions(fiscalYear)
                .then(function (deliverableDefinitions) {
                    var deliverableDefinitionsByMonth = this.filterDefinitionsForFiscalMonth(fiscalMonth, deliverableDefinitions);
                    deferred.resolve(deliverableDefinitionsByMonth);
                });

            return deferred.promise;
        }


        stakeholdersModal():ng.ui.bootstrap.IModalServiceInstance {
            var deliverableDefinition = this;
            return this.$modal.open({
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
        getFyDefinitions(fy:number):ng.IPromise<ap.IndexedCache> {
            var model = this;
            /** Unique query name (ex: fy2013) */
            var fyCacheKey:string = 'fy' + fy;

            /** Make request from server is fy request hasn't already been made */
            if (!model.cachedFyRequests[fy]) {
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
         * @name deliverableDefinitionsModel.filterDefinitionsForFiscalMonth
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @param {Object|Array} deliverableDefinitions
         * @returns {Object} deliverableDefinitionsByMonth with keys of definition id and value of the definition.
         */
        filterDefinitionsForFiscalMonth(fiscalMonth:number, deliverableDefinitions:IDeliverableDefinition[]): Object {
            //Need to get use calendar month instead of fiscal month in order to get due dates for a month
            var calendarMonth = calendarService.getCalendarMonth(fiscalMonth);

            var deliverableDefinitionsByMonth = {};

            _.each(deliverableDefinitions, function (deliverableDefinition) {

                //Retrieve array of all due dates for this deliverable for the given month
                var dueDatesThisMonth = deliverableDefinition.getDeliverableDueDatesForMonth(calendarMonth);

                if (dueDatesThisMonth.length > 0) {
                    deliverableDefinitionsByMonth[deliverableDefinition.id] = deliverableDefinition;
                }

            });

            return deliverableDefinitionsByMonth;
        }


    }





    angular
        .module('pmam-deliverables')
        .service('deliverableDefinitionsModel', DeliverableDefinitionsModel);
}
