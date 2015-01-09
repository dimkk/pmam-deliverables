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
     * @requires apModalService
     */
    angular
        .module('pmam-deliverables')
        .service('deliverableFeedbackModel', deliverableFeedbackModel);

    function deliverableFeedbackModel(_, apModelFactory, apModalService) {

        /********************* Model Definition ***************************************/

        /**
         * @ngdoc object
         * @name deliverableFeedbackModel.model
         * @description
         *  Model Constructor
         */
        var model = apModelFactory.create({
            factory: DeliverableFeedback,
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
                    {
                        staticName: 'Definition_x003a_Deliverable_x00',
                        objectType: 'Lookup',
                        mappedName: 'definitiondeliverable',
                        readOnly: false
                    },
                    {
                        staticName: 'Definition_x003a_Title',
                        objectType: 'Lookup',
                        mappedName: 'definitiontitle',
                        readOnly: false
                    },
                    {staticName: 'Deliverable', objectType: 'Lookup', mappedName: 'deliverable', readOnly: false},
                    {
                        staticName: 'Deliverable_x003a_Submission_x00',
                        objectType: 'Lookup',
                        mappedName: 'deliverablesubmission',
                        readOnly: false
                    },
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

        DeliverableFeedback.prototype.openModal = openModal;


        /** Optionally add a modal form **/
        model.openModal = apModalService.modalModelProvider({
            templateUrl: '',
            controller: '',
            expectedArguments: ['entity']
        });

        model.getCachedFeedbackByDeliverableId = getCachedFeedbackByDeliverableId;

        function openModal() {
            var listItem = this;
            return model.openModal(listItem);
        }

        var feedbackByDeliverableId = {};

        function registerFeedbackByDeliverable(feedback) {
            feedbackByDeliverableId[feedback.deliverable.lookupId] = feedbackByDeliverableId[feedback.deliverable.lookupId] || {};
            /** Only register modifications that have been saved to the server and add to cache if not already there */
            if(feedback.id && !feedbackByDeliverableId[feedback.deliverable.lookupId][feedback.id]) {
                feedbackByDeliverableId[feedback.deliverable.lookupId][feedback.id] = feedback;
            }
        }

        function removeFeedbackByDeliverable(feedback) {
            if(feedbackByDeliverableId[feedback.deliverable.lookupId][feedback.id]) {
                /** Remove cached feedback */
                delete feedbackByDeliverableId[feedback.deliverable.lookupId][feedback.id];
            }
        }

        function getCachedFeedbackByDeliverableId(deliverableId) {
            return feedbackByDeliverableId[deliverableId];
        }



        /*********************************** Queries ***************************************/

        /** Fetch data (pulls local xml if offline named model.list.title + '.xml')
         *  Initially pulls all requested data.  Each subsequent call just pulls records that have been changed,
         *  updates the model, and returns a reference to the updated data array
         * @returns {Array} Requested list items
         */
        model.registerQuery({
            name: 'primary',
            query: '' +
            '<Query>' +
            '   <OrderBy>' +
            '       <FieldRef Name="ID" Ascending="TRUE"/>' +
            '   </OrderBy>' +
            '</Query>'
        });

        /********************* Model Specific Shared Functions ***************************************/


        return model;
    }
})();
