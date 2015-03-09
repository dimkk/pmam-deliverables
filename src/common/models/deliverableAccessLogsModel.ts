/// <reference path="../../../typings/tsd.d.ts" />

module app.services {
    'use strict';

    interface IDeliverableAccessLog extends ap.ListItem {
        deliverable?:ap.Lookup;
        fy?:number;
    }

    interface IDeliverableAccessLogsModel extends ap.Model {
        cachedFyRequests:Object;
        list:ap.List;
        getCachedLogByDeliverableId(deliverableId:number):IDeliverableAccessLog[];
        registerLogByDeliverable?(accessLog:IDeliverableAccessLog):void;
        removeLogByDeliverable(accessLog:IDeliverableAccessLog):void;
    }

    export class DeliverableAccessLogsModel implements IDeliverableAccessLogsModel {
        constructor(private _, private apModelFactory, private moment) {
            apModelFactory.create(this);
        }

        /** Local access log cache organized by deliverable id */
        accessLogsByDeliverableId = {};
        cachedFyRequests = {};
        factory = DeliverableAccessLog;
        list = <ap.List>{
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
         * @name deliverableAccessLogModel.getCachedLogByDeliverableId
         * @description Pulls cached logs for a given deliverable.
         * @param {number} deliverableId
         * @returns {DeliverableAccessLog[]} Array of matching access logs for a given deliverable.
         */
        getCachedLogByDeliverableId(deliverableId:number):IDeliverableAccessLog[] {
            return this.accessLogsByDeliverableId[deliverableId];
        }

        /**
         * @name deliverableAccessLogModel.registerLogByDeliverable
         * @description Adds a accessLog element to a cache that is grouped by deliverable to make later retrieval immediate
         * @param {DeliverableAccessLog} accessLog
         */
        public registerLogByDeliverable(accessLog:IDeliverableAccessLog):void {
            if (accessLog.deliverable.lookupId) {
                this.accessLogsByDeliverableId[accessLog.deliverable.lookupId] = this.accessLogsByDeliverableId[accessLog.deliverable.lookupId] || {};
                /** Only register modifications that have been saved to the server and add to cache if not already there */
                if (accessLog.id && !this.accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id]) {
                    this.accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id] = accessLog;
                }
            }

        }

        /**
         * @name deliverableAccessLogModel.removeLogByDeliverable
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

    class DeliverableAccessLog implements IDeliverableAccessLog {
        modified:Date;
        created:Date;
        constructor(obj) {
            var self = this;
            _.extend(self, obj);
            /** Store in cached object so we can reference by requirement id when filtering */
            DeliverableAccessLogsModel.registerLogByDeliverable(self);
        }

        /** Modify standard prototype delete logic so we can remove from cache prior to actually deleting */
        _deleteItem = this.deleteItem;

        deleteItem():ng.IDeferred<any> {
            DeliverableAccessLogsModel.removeLogByDeliverable(self);
            return this._deleteItem();
        }

        /**
         * @name DeliverableAccessLog.getReviewDuration
         * @description A record is created when a user accesses a deliverable details form.  It is then updated when the
         * user leaves the form so this method returns the number of milliseconds between the created and modified
         * dates.
         * @returns {Number} Number of milliseconds between log created and modified dates.
         */
        getReviewDuration():number {
            /** Get the number of milliseconds between modified and created */
            return moment(this.modified).diff(this.created);
        }


        /**
         * @name DeliverableAccessLog.getHumanizedReviewDuration
         * @returns {String} Humanized version of duration (eg. 'a few seconds')
         */
        getHumanizedReviewDuration():string {
            /** Return the duration as a humanized string (eg 'a few seconds') */
            return moment.duration(this.getReviewDuration()).humanize();
        }

    }

    angular
        .module('pmam-deliverables')
        .service('deliverableAccessLogsModel', DeliverableAccessLogsModel);
}
