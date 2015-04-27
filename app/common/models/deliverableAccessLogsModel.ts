/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';


    var model:DeliverableAccessLogModel, apLookupCacheService;

    export class DeliverableAccessLog extends ap.ListItem {
        deliverable:ap.ILookup;
        fy:number;
        _deleteItem();
        constructor(obj) {
            super();
            _.assign(this, obj);
            var self = this;

            if (self.id) {
                /** Store in cached object so we can reference from lookup reference */
                apLookupCacheService.cacheEntityByLookupId(self, model.lookupFieldsToCache);
                /** Modify standard delete logic so we can remove from cache prior to actually deleting */
                self._deleteItem = self.deleteItem;
                self.deleteItem = function () {
                    apLookupCacheService.removeEntityFromLookupCaches(self, model.lookupFieldsToCache);
                    return self._deleteItem();
                }
            }

        }

        /**
         * @name DeliverableAccessLog.getHumanizedReviewDuration
         * @returns {String} Humanized version of duration (eg. 'a few seconds')
         */
        getHumanizedReviewDuration():string {
            /** Return the duration as a humanized string (eg 'a few seconds') */
            var durationString = moment.duration(this.getReviewDuration()).humanize();
            return durationString;
        }

        /**
         * @name DeliverableAccessLog.getReviewDuration
         * @description A record is created when a user accesses a deliverable details form.  It is then updated when the
         * user leaves the form so this method returns the number of milliseconds between the created and modified
         * dates.
         * @returns {Number} Number of milliseconds betweeen log created and modified dates.
         */
        getReviewDuration():number {
            /** Get the number of milliseconds between modified and created */
            var milliseconds:number = moment(this.modified).diff(moment(this.created), 'millisecond', false );
            return milliseconds;
        }


    }

    export class DeliverableAccessLogModel extends ap.Model {
        cachedFyRequests = {};
        lookupFieldsToCache = ['deliverable'];
        constructor(_apLookupCacheService_, apListItemFactory, apModelFactory) {
            apLookupCacheService = _apLookupCacheService_;
            model = this;
            super({
                factory: DeliverableAccessLog,
                /**
                 * @ngdoc object
                 * @name deliverableAccessLogModel.list
                 * @description
                 *  Contains
                 *
                 *  - list.title (Maps to the offline XML file in dev folder (no spaces))
                 *  - list.guid (GUID can be found in list properties in SharePoint designer)
                 *  - list.customFields
                 *  @requires apListFactory
                 */
                list: {
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
                }
            });

        }

        /**
         * @description Pulls cached feedback for a given deliverable.
         * @param {number} deliverableId
         * @param {boolean} [asObject=false]  Optionally prevent conversion to an array.
         * @returns { ap.IIndexedCache<DeliverableAccessLog> | DeliverableAccessLog[] } IndexedCache.
         */
        getCachedLogByDeliverableId(deliverableId: number, asObject?:boolean): ap.IIndexedCache<DeliverableAccessLog> | DeliverableAccessLog[] {
            return apLookupCacheService.retrieveLookupCacheById('deliverable', model.list.getListId(), deliverableId, asObject);
        }


        /**
         * @name deliverableAccessLogModel.getFyDefinitions
         * @description Makes a single request for deliverable access logs for a given FY.  All subsequent requests
         * return a cached promise that resolves with the original indexedCache.
         * @param {number} fy Fiscal Year
         * @returns {*}
         */
        getFyAccessLogs(fy:number):ap.IIndexedCache<DeliverableFeedback> {
            /** Unique query name (ex: fy2013) */
            var fyCacheKey = 'fy' + fy;

            /** Make request from server is fy request hasn't already been made */
            if (!model.cachedFyRequests[fy]) {
                /** Register dynamic query with model */
                model.registerQuery({
                    name: fyCacheKey,
                    operation: 'GetListItems',
                    query: '' +
                    /** Return all records for this FY */
                    `<Query>
                       <Where>
                           <Eq>
                               <FieldRef Name="FY"/>
                               <Value Type="Text">${fy}</Value>
                           </Eq>
                       </Where>
                    </Query>`
                });

                /** Cache promise so we can return for future calls */
                model.cachedFyRequests[fy] = model.executeQuery(fyCacheKey);

            }

            /** Return cached promise */
            return model.cachedFyRequests[fy];
        }

    }

    /**
     * @ngdoc service
     * @name deliverableAccessLogModel
     * @model
     * @description
     * Log to capture number of times a given deliverable has been accessed.
     *
     */
    angular
        .module('pmam-deliverables')
        .service('deliverableAccessLogModel', DeliverableAccessLogModel);

}
