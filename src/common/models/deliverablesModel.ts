/// <reference path="../../../typings/tsd.d.ts" />

module app {
    'use strict';

    export interface IDeliverablesModel extends Model {
        factory:Function;
        deliverableByTypeId:Object;
        getCachedDeliverablesByTypeId(deliverableTypeId:number):{ [key: number]: IDeliverable; };
        filterDeliverablesForFiscalMonth(fiscalMonth:number, deliverables:IDeliverable[]):IDeliverable[];
        getDeliverablesForMonth(fiscalYear:number, fiscalMonth:number):ng.IPromise<IDeliverable[]>
        getFyDeliverables(fy:number):ng.IPromise<ap.IndexedCache>;
        registerDeliverableByType(deliverable:IDeliverable):void;
    }

    export class DeliverablesModel extends Model implements IDeliverablesModel {

        factory = Deliverable;

        /** Local Deliverable cache organized by deliverable type id */
        deliverableByTypeId = {};

        list = {
            title: 'Deliverables',
            /**Maps to the offline XML file in dev folder (no spaces) */
            guid: '{5F7B373D-E9D4-4D52-8B34-64D5144F5451}',
            /**List GUID can be found in list properties in SharePoint designer */
            customFields: [
            /** Array of objects mapping each SharePoint field to a property on a list item object */
            /** If OneApp live templates have been imported type 'oafield' followed by the tab key for
             /*  each field to quickly map with available options */
                {staticName: "Title", objectType: "Text", mappedName: "title", readOnly: false},
                {staticName: "Type", objectType: "Lookup", mappedName: "deliverableType", readOnly: false},
                {staticName: "StartDate", objectType: "DateTime", mappedName: "startDate", readOnly: false},
                {
                    staticName: "SubmissionDate",
                    objectType: "DateTime",
                    mappedName: "submissionDate",
                    readOnly: false
                },
                {staticName: 'DueDate', objectType: 'DateTime', mappedName: 'dueDate', readOnly: false},

            /** FY is October - September (Actually a string in SharePoint but we call it Integer for automatic type conversion*/
                {staticName: "FY", objectType: "Integer", mappedName: "fy", readOnly: false},
            /** Fiscal month number (1-12) with 1 being October and 12 being September */
                {staticName: 'Month', objectType: 'Integer', mappedName: 'fiscalMonth', readOnly: false},
                {staticName: "Details", objectType: "Text", mappedName: "details", readOnly: false},
                {staticName: "Justification", objectType: "Text", mappedName: "justification", readOnly: false},
                {staticName: "To", objectType: "UserMulti", mappedName: "to", readOnly: false},
                {staticName: "CC", objectType: "UserMulti", mappedName: "cc", readOnly: false},
                {
                    staticName: 'DiscussionThread',
                    objectType: 'JSON',
                    mappedName: 'discussionThread',
                    readOnly: false
                },
            /** Flagged once To/CC emails have been generated to notify stakeholders. */
                {
                    staticName: 'StakeholdersNotified',
                    objectType: 'Boolean',
                    mappedName: 'stakeholdersNotified',
                    readOnly: false
                },
                {staticName: 'Attachments', objectType: 'Attachments', mappedName: 'attachments', readOnly: true}

                ]
        };

        constructor() {
            //super();
            //var parent = super;
            //super.$inject = ['apCacheService', 'apDataService', 'apListFactory', 'apListItemFactory', 'apQueryFactory',
            //    'apUtilityService', 'apFieldService', 'apConfig', 'apDecodeService', '$q', 'toastr'];
            super()
        }


        /**
         * @name deliverablesModel.getCachedDeliverablesByTypeId
         * @param {number} deliverableTypeId
         * @description Allows us to retrieve deliverables for a given definition which have already been
         * grouped/cache by definition id.
         * @returns {object} Keys of deliverable id and values of the deliverables themselves.
         */
        getCachedDeliverablesByTypeId(deliverableTypeId:number):{ [key: number]: IDeliverable; } {
            return this.deliverableByTypeId[deliverableTypeId];
        }

        /**
         * @name deliverablesModel.getDeliverablesForMonth
         * @param {number} fiscalYear Fiscal Year (October - September)
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @returns {promise} object[]
         */
        getDeliverablesForMonth(fiscalYear:number, fiscalMonth:number):ng.IPromise<IDeliverable[]> {

            var deferred = this.$q.defer();

            this.getFyDeliverables(fiscalYear)
                .then(function (indexedCache) {
                    var deliverablesForMonth = this.filterDeliverablesForFiscalMonth(fiscalMonth, indexedCache);
                    deferred.resolve(deliverablesForMonth);
                });
            return deferred.promise;
        }

        /**
         * @name deliverablesModel.getFyDeliverables
         * @param {number} fy Fiscal year.
         * @description
         * @returns {*|Object}
         */
        getFyDeliverables(fy:number):ng.IPromise<ap.IndexedCache> {
            var model = this;
            /** Unique query name (ex: fy2013) */
            var fyCacheKey = 'fy' + fy;

            /** Register fy query if it doesn't exist */
            if (!_.isObject(model.queries[fyCacheKey])) {
                model.registerQuery({
                    name: fyCacheKey,
                    query: '' +
                    '<Query>' +
                    '   <Where>' +
                    /** Return all records for this FY */
                    '       <Eq>' +
                    '           <FieldRef Name="FY"/>' +
                    '           <Value Type="Text">' + fy + '</Value>' +
                    '       </Eq>' +
                    '   </Where>' +
                    '</Query>'
                });
            }

            return model.executeQuery(fyCacheKey);
        }

        /**
         * @name deliverablesModel.filterDeliverablesForFiscalMonth
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @param {Object|Array} deliverables
         * @returns {Deliverable[]}  Array of deliverables for the month.
         */
        filterDeliverablesForFiscalMonth(fiscalMonth:number, deliverables:IDeliverable[]):IDeliverable[] {
            var deliverablesForMonth = _.where(deliverables, function (deliverable) {
                return deliverable.fiscalMonth === fiscalMonth;
            });
            return deliverablesForMonth;
        }

        registerDeliverableByType(deliverable:IDeliverable):void {
            if (deliverable.deliverableType.lookupId) {
                this.deliverableByTypeId[deliverable.deliverableType.lookupId] = this.deliverableByTypeId[deliverable.deliverableType.lookupId] || {};
                /** Only register modifications that have been saved to the server and add to cache if not already there */
                if (deliverable.id && !this.deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id]) {
                    this.deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id] = deliverable;
                }
            }
        }

    }

    angular
        .module('pmam-deliverables')
        .service('deliverablesModel', DeliverablesModel);
}
