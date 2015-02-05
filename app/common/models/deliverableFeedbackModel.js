(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name deliverableFeedbackModel
     * @model
     * @description
     *
     *
     * @requires apModelFactory
     */
    angular
        .module('pmam-deliverables')
        .factory('deliverableFeedbackModel', deliverableFeedbackModel);

    function deliverableFeedbackModel(_, apModelFactory) {

        /** Local feedback cache organized by deliverable id */
        var feedbackByDeliverableId = {};

        /********************* Model Definition ***************************************/

        /**
         * @ngdoc object
         * @name deliverableFeedbackModel.model
         * @description
         *  Model Constructor
         */
        var model = apModelFactory.create({
            factory: DeliverableFeedback,
            getCachedFeedbackByDeliverableId: getCachedFeedbackByDeliverableId,
            getFyFeedback: getFyFeedback,
            /**
             * @ngdoc object
             * @name deliverableFeedbackModel.list
             * @description
             *  Contains
             *
             *  - list.title (Maps to the offline XML file in dev folder (no spaces))
             *  - list.guid (GUID can be found in list properties in SharePoint designer)
             *  - list.customFields
             *  @requires apListFactory
             */
            list: {
                title: 'DeliverableFeedback',
                /**Maps to the offline XML file in dev folder (no spaces) */
                guid: '{00A69513-BB63-4333-9639-EB14C08269DB}',
                /**List GUID can be found in list properties in SharePoint designer */
                customFields: [
                /** Array of objects mapping each SharePoint field to a property on a list item object */
                /** If OneApp live templates have been imported type 'oafield' followed by the tab key for
                 /*  each field to quickly map with available options */
                    //TODO These field names are pretty bad, think about fixing
                    //Ex: {staticName: 'Title', objectType: 'Text', mappedName: 'title', readOnly: false}
                    {staticName: 'Title', objectType: 'Text', mappedName: 'title', readOnly: false},
                    {staticName: 'Comments', objectType: 'Text', mappedName: 'comments', readOnly: false},
                    {staticName: 'Definition', objectType: 'Lookup', mappedName: 'definition', readOnly: false},
                    /* Dependent lookup, returns normal lookup but the lookupValue contains the FY
                     value on the linked deliverable.  This value is read-only. */
                    {
                        staticName: 'Definition_x003a_FY',
                        objectType: 'Lookup',
                        mappedName: 'fy',
                        readOnly: true
                    },
                    {staticName: 'Deliverable', objectType: 'Lookup', mappedName: 'deliverable', readOnly: false},
                    {staticName: 'Rating', objectType: 'Integer', mappedName: 'rating', readOnly: false}
                ]
            }
        });

        /*********************************** Factory and Methods ***************************************/
        /**
         * @ngdoc function
         * @name deliverableFeedbackModel.DeliverableFeedback
         * @description
         * Entity Constructor
         * @param {object} obj New entity to extend.
         * @constructor
         */
        function DeliverableFeedback(obj) {
            var self = this;
            _.extend(self, obj);
            /** Store in cached object so we can reference by requirement id when filtering */
            registerFeedbackByDeliverable(self);
            /** Modify standard prototype delete logic so we can remove from cache prior to actually deleting */
            self._deleteItem = self.deleteItem;
            self.deleteItem = function() {
                removeFeedbackByDeliverable(self);
                return self._deleteItem();
            }
        }

        /**
         * @description Adds a feedback element to a cache that is grouped by deliverable to make later retrieval immediate
         * @param {DeliverableFeedback} feedback
         */
        function registerFeedbackByDeliverable(feedback) {
            if (feedback.deliverable.lookupId) {
                feedbackByDeliverableId[feedback.deliverable.lookupId] = feedbackByDeliverableId[feedback.deliverable.lookupId] || {};
                /** Only register modifications that have been saved to the server and add to cache if not already there */
                if (feedback.id && !feedbackByDeliverableId[feedback.deliverable.lookupId][feedback.id]) {
                    feedbackByDeliverableId[feedback.deliverable.lookupId][feedback.id] = feedback;
                }
            }

        }

        /**
         * @description Removes a feedback element from the local cache.
         * @param {DeliverableFeedback} feedback
         */
        function removeFeedbackByDeliverable(feedback) {
            if(feedbackByDeliverableId[feedback.deliverable.lookupId][feedback.id]) {
                /** Remove cached feedback */
                delete feedbackByDeliverableId[feedback.deliverable.lookupId][feedback.id];
            }
        }

        /**
         * @description Pulls cached feedback for a given deliverable.
         * @param {number} deliverableId
         * @returns {DeliverableFeedback[]} Array of matching feedback for a given deliverable.
         */
        function getCachedFeedbackByDeliverableId(deliverableId) {
            return feedbackByDeliverableId[deliverableId];
        }

        /*********************************** Queries ***************************************/

        function getFyFeedback(fy) {
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
                    '           <FieldRef Name="Definition_x003a_FY"/>' +
                    '           <Value Type="Text">' + fy + '</Value>' +
                    '       </Eq>' +
                    '   </Where>' +
                    '</Query>'
                });
            }

            return model.executeQuery(fyCacheKey);
        }


        /********************* Model Specific Shared Functions ***************************************/


        return model;
    }
})();
