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

/** Local access log cache organized by deliverable id */
var accessLogsByDeliverableId = {};
var moment = window.moment;
var _ = window._;
/**
 * @ngdoc function
 * @name deliverableAccessLogModel.DeliverableAccessLog
 * @description
 * Entity Constructor
 * @param {object} obj New entity to extend.
 * @constructor
 */
class DeliverableAccessLog {
    constructor(obj) {
        _.extend(this, obj);
        /** Store in cached object so we can reference by requirement id when filtering */
        registerLogByDeliverable(this);
        /** Modify standard prototype delete logic so we can remove from cache prior to actually deleting */
        this._deleteItem = this.deleteItem;
        this.deleteItem = function () {
            removeLogByDeliverable(this);
            return this._deleteItem();
        };
    }

    /**
     * @name DeliverableAccessLog.getReviewDuration
     * @description A record is created when a user accesses a deliverable details form.  It is then updated when the
     * user leaves the form so this method returns the number of milliseconds between the created and modified
     * dates.
     * @returns {Number} Number of milliseconds betweeen log created and modified dates.
     */
    getReviewDuration() {
        var logEntry = this;
        /** Get the number of milliseconds between modified and created */
        var milliseconds = moment(logEntry.modified).diff(logEntry.created);
        return milliseconds;
    }

    /**
     * @name DeliverableAccessLog.getHumanizedReviewDuration
     * @returns {String} Humanized version of duration (eg. 'a few seconds')
     */
    getHumanizedReviewDuration() {
        var logEntry = this;
        /** Return the duration as a humanized string (eg 'a few seconds') */
        var durationString = moment.duration(logEntry.getReviewDuration()).humanize();
        return durationString;
    }


}


class deliverableAccessLogModel {
    constructor(_, apModelFactory) {
        apModelFactory.create(this);
    }
    cachedFyRequests = {};
    factory = DeliverableAccessLog;

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
    list = {
        title: "DeliverableAccessLogs",
        /**Maps to the offline XML file in dev folder (no spaces) */
        guid: "{B6571D8F-2A10-43DE-8645-615487B7F452}",
        /**List GUID can be found in list properties in SharePoint designer */
        customFields: [
        /** Array of objects mapping each SharePoint field to a property on a list item object */
            {staticName: "Deliverable", objectType: "Lookup", mappedName: "deliverable", readOnly: false},
        /** We index this field in SharePoint to speed up response times */
            {staticName: "FY", objectType: "Integer", mappedName: "fy", readOnly: false}]
    };

    /**
     * @name deliverableAccessLogModel.getFyDefinitions
     * @description Makes a single request for deliverable access logs for a given FY.  All subsequent requests
     * return a cached promise that resolves with the original indexedCache.
     * @param {number} fy Fiscal Year
     * @returns {*}
     */
    getFyAccessLogs(fy) {
        /** Unique query name (ex: fy2013) */
        var fyCacheKey = "fy" + fy;

        /** Make request from server is fy request hasn't already been made */
        if (!this.cachedFyRequests[fy]) {
            /** Register dynamic query with model */
            this.registerQuery({
                name: fyCacheKey,
                operation: "GetListItems",
                query: "" + "<Query>" + "   <Where>" +
                /** Return all records for this FY */
                "       <Eq>" + "           <FieldRef Name=\"FY\"/>" + "           <Value Type=\"Text\">" + fy + "</Value>" + "       </Eq>" + "   </Where>" + "</Query>"
            });

            /** Cache promise so we can return for future calls */
            this.cachedFyRequests[fy] = this.executeQuery(fyCacheKey);
        }

        /** Return cached promise */
        return this.cachedFyRequests[fy];
    }

    /**
     * @name deliverableAccessLogModel.getCachedLogByDeliverableId
     * @description Pulls cached logs for a given deliverable.
     * @param {number} deliverableId
     * @returns {DeliverableAccessLog[]} Array of matching access logs for a given deliverable.
     */
    getCachedLogByDeliverableId(deliverableId) {
        return accessLogsByDeliverableId[deliverableId];
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
    if (accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id]) {
        /** Remove cached accessLog */
        delete accessLogsByDeliverableId[accessLog.deliverable.lookupId][accessLog.id];
    }
}

export default deliverableAccessLogModel;
