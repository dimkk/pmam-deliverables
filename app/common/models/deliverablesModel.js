(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name deliverablesModel
     * @model
     * @description
     *
     *
     * @requires apModelFactory
     */
    angular
        .module('pmam-deliverables')
        .factory('deliverablesModel', deliverablesModel);

    function deliverablesModel(_, apModelFactory, apDiscussionThreadFactory, deliverableFeedbackModel,
                               deliverableDefinitionsModel, calendarService, user) {

        /** Local Deliverable cache organized by deliverable type id */
        var deliverableByTypeId = {};

        /********************* Model Definition ***************************************/

        /**
         * @ngdoc object
         * @name deliverablesModel
         * @description
         *  Model Constructor
         */
        var model = apModelFactory.create({
            getCachedDeliverablesByTypeId: getCachedDeliverablesByTypeId,
            getFyDeliverables: getFyDeliverables,
            factory: Deliverable,
            /**
             * @ngdoc object
             * @name deliverablesModel.list
             * @description
             *  Contains
             *
             *  - list.title (Maps to the offline XML file in dev folder (no spaces))
             *  - list.guid (GUID can be found in list properties in SharePoint designer)
             *  - list.customFields
             *  @requires apListFactory
             */
            list: {
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
                    /** FY is October - September */
                    {staticName: "FY", objectType: "text", mappedName: "fy", readOnly: false},
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
                    }

                ]
            }
        });

        /*********************************** Factory and Methods ***************************************/
        /**
         * @ngdoc function
         * @name deliverablesModel.Deliverable
         * @description
         * Entity Constructor
         * @param {object} obj New entity to extend.
         * @constructor
         */
        function Deliverable(obj) {
            var self = this;
            _.extend(self, obj);
            self.displayDate = moment(self.submissionDate).format('MMM YY');
            /** Instantiate a new discussion object even if there isn't an active discussion */
            self.discussionThread = apDiscussionThreadFactory.createDiscussionObject(self, 'discussionThread');

            /** Store in cached object so we can reference by deliverable type directly from the type without needing to iterate over anything*/
            registerDeliverableByType(self);
            /** Modify standard prototype delete logic so we can remove from cache prior to actually deleting */
            self._deleteItem = self.deleteItem;
            self.deleteItem = function() {
                removeDeliverableByType(self);
                return self._deleteItem();
            }
        }

        Deliverable.prototype.getCachedFeedbackByDeliverableId = getCachedFeedbackByDeliverableId;
        Deliverable.prototype.getCachedFeedbackForCurrentUser = getCachedFeedbackForCurrentUser;
        Deliverable.prototype.getCalendarMonth = getCalendarMonth;
        Deliverable.prototype.getDeliverableDefinition = getDeliverableDefinition;

        return model;

        /**==================PRIVATE==================*/


        /**
         * @name Deliverable.getCachedFeedbackByDeliverableId
         * @description Allows us to retrieve all feedback for a given deliverable which have already been
         * grouped/cached by deliverable id.
         * @returns {object} Keys of deliverable feedback id's and values of the feeback themselves.
         */
        function getCachedFeedbackByDeliverableId() {
            var self = this;
            return deliverableFeedbackModel.getCachedFeedbackByDeliverableId(self.id);
        }

        /**
         * @name Deliverable.getCachedFeedbackForCurrentUser
         * @returns {deliverableFeedbackModel.DeliverableFeedback} Either an existing feedback record or empty record.
         */
        function getCachedFeedbackForCurrentUser() {
            var self = this, feedbackForUser,
                feedbackForDeliverable = self.getCachedFeedbackByDeliverableId();
            if(feedbackForDeliverable) {
                _.each(feedbackForDeliverable, function(feedback) {
                    if(feedback.author.lookupId === user.lookupId) {
                        feedbackForUser = feedback;
                    }
                });
            }
            /** Create a placeholder if one is found */
            if(!feedbackForUser) {
                feedbackForUser = deliverableFeedbackModel.createEmptyItem({
                    rating: 0,
                    deliverable: {lookupId: self.id}
                });
            }
            return feedbackForUser;
        }

        /**
         * @name Deliverable.getDeliverableDefinition
         * @description Adds ability to reference the deliverable definition directly from any deliverable object
         * @returns {deliverableDefinitionsModel.factory} DeliverableDefinition
         */
        function getDeliverableDefinition() {
            var self = this;
            return deliverableDefinitionsModel.getCachedEntity(self.deliverableType.lookupId);
        }


        /*********************************** Queries ***************************************/

        /**
         * @name model.getFyDeliverables
         * @param {number} fy Fiscal year.
         * @description
         * @returns {*|Object}
         */
        function getFyDeliverables(fy) {
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


        /********************* Model Specific Shared Functions ***************************************/

        /**
         * @name Deliverable.getCalendarMonth
         * @description Month is the FY Month (1-12), method converts into calendar month (0-11)
         * @returns {number} Integer 0-11
         */
        function getCalendarMonth() {
            var deliverable = this;
            return calendarService.getCalendarMonth(deliverable.fiscalMonth);
        }

        function registerDeliverableByType(deliverable) {
            if (deliverable.deliverableType.lookupId) {
                deliverableByTypeId[deliverable.deliverableType.lookupId] = deliverableByTypeId[deliverable.deliverableType.lookupId] || {};
                /** Only register modifications that have been saved to the server and add to cache if not already there */
                if (deliverable.id && !deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id]) {
                    deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id] = deliverable;
                }
            }
        }

        function removeDeliverableByType(deliverable) {
            if(deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id]) {
                /** Remove cached deliverable */
                delete deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id];
            }
        }

        /**
         * @name model.getCachedDeliverablesByTypeId
         * @param {number} deliverableTypeId
         * @description Allows us to retrieve deliverables for a given definition which have already been
         * grouped/cache by definition id.
         * @returns {object} Keys of deliverable id and values of the deliverables themselves.
         */
        function getCachedDeliverablesByTypeId(deliverableTypeId) {
            return deliverableByTypeId[deliverableTypeId];
        }

    }
})();
