/// <reference path="../../../typings/tsd.d.ts" />


module app.models {
    'use strict';


    export interface IDeliverableFeedbackModel extends ap.Model {
        feedbackByDeliverableId:{[index:number]:IDeliverableFeedback};
        getCachedFeedbackByDeliverableId(deliverableId:number):IDeliverableFeedback[];
        getFyFeedback(fy:number):ng.IPromise<ap.IndexedCache>;
        registerFeedbackByDeliverable(feedback:IDeliverableFeedback):void;
        removeFeedbackByDeliverable(feedback:IDeliverableFeedback):void;
    }

    export class DeliverableFeedbackModel implements IDeliverableFeedbackModel {
        constructor(_, private apModelFactory) {
            apModelFactory.create(this);
        }
        factory = app.models.DeliverableFeedback;
        /** Local feedback cache organized by deliverable id */
        feedbackByDeliverableId = {};
        list = {
            title: 'DeliverableFeedback',
            /**Maps to the offline XML file in dev folder (no spaces) */
            guid: '{00A69513-BB63-4333-9639-EB14C08269DB}',
            /**List GUID can be found in list properties in SharePoint designer */
            customFields: [
            /** Array of objects mapping each SharePoint field to a property on a list item object */
            /** If OneApp live templates have been imported type 'oafield' followed by the tab key for
             /*  each field to quickly map with available options */
                {staticName: 'Title', objectType: 'Text', mappedName: 'title', readOnly: false},
                {staticName: 'Comments', objectType: 'Note', mappedName: 'comments', readOnly: false},
            /** FY is October - September (Actually a string in SharePoint but we call it Integer for automatic type conversion*/
                {staticName: "FY", objectType: "Integer", mappedName: "fy", readOnly: false},
                {staticName: 'Acceptable', objectType: 'Boolean', mappedName: 'acceptable', readOnly: false},
                {staticName: 'DeliverableDefinition', objectType: 'Lookup', mappedName: 'definition', readOnly: false},
                {staticName: 'Deliverable', objectType: 'Lookup', mappedName: 'deliverable', readOnly: false},
                {staticName: 'Rating', objectType: 'Integer', mappedName: 'rating', readOnly: false}
                ]
        };

        /**
         * @description Adds a feedback element to a cache that is grouped by deliverable to make later retrieval immediate
         * @param {DeliverableFeedback} feedback
         */
        registerFeedbackByDeliverable(feedback:IDeliverableFeedback):void {
            if (feedback.deliverable.lookupId) {
                this.feedbackByDeliverableId[feedback.deliverable.lookupId] = this.IDeliverableFeedback[feedback.deliverable.lookupId] || {};
                /** Only register modifications that have been saved to the server and add to cache if not already there */
                if (feedback.id && !this.IDeliverableFeedback[feedback.deliverable.lookupId][feedback.id]) {
                    this.IDeliverableFeedback[feedback.deliverable.lookupId][feedback.id] = feedback;
                }
            }
        }

        /**
         * @description Removes a feedback element from the local cache.
         * @param {DeliverableFeedback} feedback
         */
        removeFeedbackByDeliverable(feedback:IDeliverableFeedback):void {
            if (this.IDeliverableFeedback[feedback.deliverable.lookupId][feedback.id]) {
                /** Remove cached feedback */
                delete this.IDeliverableFeedback[feedback.deliverable.lookupId][feedback.id];
            }
        }

        /**
         * @description Pulls cached feedback for a given deliverable.
         * @param {number} deliverableId
         * @returns {DeliverableFeedback[]} Array of matching feedback for a given deliverable.
         */
        getCachedFeedbackByDeliverableId(deliverableId:number):IDeliverableFeedback[] {
            return this.IDeliverableFeedback[deliverableId];
        }

        /*********************************** Queries ***************************************/

        getFyFeedback(fy:number):ng.IPromise<ap.IndexedCache> {
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

    }

    angular
        .module('pmam-deliverables')
        .service('deliverableFeedbackModel', DeliverableFeedbackModel);
}
