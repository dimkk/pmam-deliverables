(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name deliverableAccessLogModel
     * @model
     * @description
     * Log to capture number of times a given deliverable has been accessed.
     *
     * @requires apModelFactory
     * @requires apModalService
     */
    angular
        .module('pmam-deliverables')
        .service('deliverableAccessLogModel', deliverableAccessLogModel);

    function deliverableAccessLogModel(_, apModelFactory) {

        /** Local access log cache organized by deliverable id */
        var accessLogsByDeliverableId = {};


        /********************* Model Definition ***************************************/

        /**
         * @ngdoc object
         * @name deliverableAccessLogModel.model
         * @description
         *  Model Constructor
         */
        var model = apModelFactory.create({
            cachedFyRequests: {},
            factory: DeliverableAccessLog,
            getCachedLogByDeliverableId: getCachedLogByDeliverableId,
            getFyAccessLogs: getFyAccessLogs,
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

        /*********************************** Factory and Methods ***************************************/
        /**
         * @ngdoc function
         * @name deliverableAccessLogModel.DeliverableAccessLog
         * @description
         * Entity Constructor
         * @param {object} obj New entity to extend.
         * @constructor
         */
        function DeliverableAccessLog(obj) {
            var self = this;
            _.extend(self, obj);
            /** Store in cached object so we can reference by requirement id when filtering */
            registerLogByDeliverable(self);
            /** Modify standard prototype delete logic so we can remove from cache prior to actually deleting */
            self._deleteItem = self.deleteItem;
            self.deleteItem = function() {
                removeLogByDeliverable(self);
                return self._deleteItem();
            }

        }

        /**
         * @name deliverableAccessLogModel.registerLogByDeliverable
         * @description Adds a accessLog element to a cache that is grouped by deliverable to make later retrieval immediate
         * @param {DeliverableAccessLog} accessLog
         */
        function registerLogByDeliverable(accessLog) {
            if (accessLog.deliverable.lookupId) {
                accessLogsByDeliverableId[accessLog.deliverable.lookupId] = accessLogsByDeliverableId[accessLog.deliverable.lookupId] || {};
                /** Only register modifications that have been saved to the server and add to cache if not already there */
                if (accessLog.id && !accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id]) {
                    accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id] = accessLog;
                }
            }

        }

        /**
         * @name deliverableAccessLogModel.removeLogByDeliverable
         * @description Removes a accessLog element from the local cache.
         * @param {DeliverableAccessLog} accessLog
         */
        function removeLogByDeliverable(accessLog) {
            if(accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id]) {
                /** Remove cached accessLog */
                delete accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id];
            }
        }

        /**
         * @name deliverableAccessLogModel.getCachedLogByDeliverableId
         * @description Pulls cached logs for a given deliverable.
         * @param {number} deliverableId
         * @returns {DeliverableAccessLog[]} Array of matching access logs for a given deliverable.
         */
        function getCachedLogByDeliverableId(deliverableId) {
            return accessLogsByDeliverableId[deliverableId];
        }


        /*********************************** Queries ***************************************/

        /**
         * @name deliverableAccessLogModel.getFyDefinitions
         * @description Makes a single request for deliverable access logs for a given FY.  All subsequent requests
         * return a cached promise that resolves with the original indexedCache.
         * @param {number} fy Fiscal Year
         * @returns {*}
         */
        function getFyAccessLogs(fy) {
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


        return model;
    }
})();
