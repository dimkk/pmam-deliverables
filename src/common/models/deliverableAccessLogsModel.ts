/// <reference path="../../../typings/tsd.d.ts" />

module app.models {
    'use strict';

    export interface IDeliverableAccessLogsModel extends ap.Model {
        cachedFyRequests:{ [key: number]: IDeliverableAccessLog[]; };
        list:ap.List;
        getCachedLogByDeliverableId(deliverableId:number):IDeliverableAccessLog[];
        registerLogByDeliverable(accessLog:IDeliverableAccessLog):void;
        removeLogByDeliverable(accessLog:IDeliverableAccessLog):void;
    }

    export class DeliverableAccessLogsModel implements IDeliverableAccessLogsModel {
        constructor(private _, private apModelFactory, private moment) {
            //this.factory = app.models.DeliverableAccessLog;
            apModelFactory.create(this);
        }
        factory = app.models.DeliverableAccessLog;

        /** Local access log cache organized by deliverable id */
        accessLogsByDeliverableId = {};
        cachedFyRequests = {};
        list = {
            title: 'DeliverableAccessLogs',
            /**Maps to the offline XML file in dev folder (no spaces) */
            guid: '{B6571D8F-2A10-43DE-8645-615487B7F452}',
            /**List GUID can be found in list properties in SharePoint designer */
            customFields: [
            /** Array of objects mapping each SharePoint field to a property on a list item object */
                {staticName: 'Deliverable', objectType: 'Lookup', mappedName: 'deliverable', readOnly: false},
            /** We index this field in SharePoint to speed up response times */
                {staticName: 'FY', objectType: 'Integer', mappedName: 'fy', readOnly: false}
            ]
        };

        /**
         * @name deliverableAccessLogsModel.getCachedLogByDeliverableId
         * @description Pulls cached logs for a given deliverable.
         * @param {number} deliverableId
         * @returns {DeliverableAccessLog[]} Array of matching access logs for a given deliverable.
         */
        getCachedLogByDeliverableId(deliverableId:number):IDeliverableAccessLog[] {
            return this.accessLogsByDeliverableId[deliverableId];
        }

        /**
         * @name deliverableAccessLogsModel.registerLogByDeliverable
         * @description Adds a accessLog element to a cache that is grouped by deliverable to make later retrieval immediate
         * @param {DeliverableAccessLog} accessLog
         */
        registerLogByDeliverable(accessLog:IDeliverableAccessLog):void {
            if (accessLog.deliverable.lookupId) {
                this.accessLogsByDeliverableId[accessLog.deliverable.lookupId] = this.accessLogsByDeliverableId[accessLog.deliverable.lookupId] || {};
                /** Only register modifications that have been saved to the server and add to cache if not already there */
                if (accessLog.id && !this.accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id]) {
                    this.accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id] = accessLog;
                }
            }
        }

        /**
         * @name deliverableAccessLogsModel.removeLogByDeliverable
         * @description Removes a accessLog element from the local cache.
         * @param {DeliverableAccessLog} accessLog
         */
        removeLogByDeliverable(accessLog:IDeliverableAccessLog):void {
            if (this.accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id]) {
                /** Remove cached accessLog */
                delete this.accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id];
            }
        }

    }


    angular
        .module('pmam-deliverables')
        .service('deliverableAccessLogsModel', DeliverableAccessLogsModel);
}
