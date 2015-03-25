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

    function deliverablesModel($q, _, apModelFactory, apDiscussionThreadFactory, moment, deliverableFeedbackModel,
                               deliverableDefinitionsModel, calendarService, deliverableFrequenciesService, user,
                               deliverableAccessLogModel, userService) {

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
            getDeliverablesForMonth: getDeliverablesForMonth,
            getFyDeliverables: getFyDeliverables,
            factory: Deliverable,
            /**
             * @ngdoc object
             * @name deliverablesModel.list
             * @description
             *  Contains
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
                    {staticName: 'DueDate', objectType: 'DateTime', mappedName: 'dueDate', readOnly: false},

                /** FY is October - September (Actually a string in SharePoint but we call it Integer for automatic type conversion*/
                    {staticName: "FY", objectType: "Integer", mappedName: "fy", readOnly: false},
                /** Fiscal month number (1-12) with 1 being October and 12 being September */
                    {staticName: 'Month', objectType: 'Integer', mappedName: 'fiscalMonth', readOnly: false},
                    {staticName: "Details", objectType: "Note", mappedName: "details", readOnly: false},
                    {staticName: "Justification", objectType: "Note", mappedName: "justification", readOnly: false},
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
            self.deleteItem = function () {
                removeDeliverableByType(self);
                return self._deleteItem();
            }
        }

        Deliverable.prototype.estimateDeliverableDueDate = estimateDeliverableDueDate;
        Deliverable.prototype.getCachedAccessLogsByDeliverableId = getCachedAccessLogsByDeliverableId;
        Deliverable.prototype.getCachedFeedbackByDeliverableId = getCachedFeedbackByDeliverableId;
        Deliverable.prototype.getCachedFeedbackForCurrentUser = getCachedFeedbackForCurrentUser;
        Deliverable.prototype.getCalendarMonth = getCalendarMonth;
        Deliverable.prototype.getDaysBetweenSubmittedAndDue = getDaysBetweenSubmittedAndDue;
        Deliverable.prototype.getDeliverableDefinition = getDeliverableDefinition;
        Deliverable.prototype.getRatingsAverage = getRatingsAverage;
        Deliverable.prototype.getViewCount = getViewCount;
        Deliverable.prototype.hasFeedback = hasFeedback;
        Deliverable.prototype.openFeedbackModal = openFeedbackModal;
        Deliverable.prototype.registerDeliverableAccessEvent = registerDeliverableAccessEvent;
        Deliverable.prototype.startDateIsRelevant = startDateIsRelevant;
        Deliverable.prototype.userCanReview = userService.userCanReview;
        Deliverable.prototype.wasDeliveredOnTime = wasDeliveredOnTime;

        return model;

        /**==================PRIVATE==================*/


        /**
         * @name Deliverable.getCachedFeedbackByDeliverableId
         * @description Allows us to retrieve all feedback for a given deliverable which have already been
         * grouped/cached by deliverable id.
         * @returns {object} Keys of deliverable feedback id's and values of the feedback themselves.
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
            if (feedbackForDeliverable) {
                _.each(feedbackForDeliverable, function (feedback) {
                    if (feedback.author.lookupId === user.lookupId) {
                        feedbackForUser = feedback;
                    }
                });
            }
            /** Create a placeholder if one is found */
            if (!feedbackForUser) {
                var deliverableDefinition = self.getDeliverableDefinition();
                feedbackForUser = deliverableFeedbackModel.createEmptyItem({
                    acceptable: null,
                    comments: '',
                    definition: self.deliverableType,
                    deliverable: {lookupId: self.id},
                    fy: deliverableDefinition.fy,
                    rating: 0
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
         * @name deliverablesModel.getFyDeliverables
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

        /**
         * @name deliverablesModel.getDeliverablesForMonth
         * @param {number} fiscalYear Fiscal Year (October - September)
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @returns {promise} object[]
         */
        function getDeliverablesForMonth(fiscalYear, fiscalMonth) {

            var deferred = $q.defer();

            getFyDeliverables(fiscalYear)
                .then(function (indexedCache) {
                    var deliverablesForMonth = filterDeliverablesForFiscalMonth(fiscalMonth, indexedCache);
                    deferred.resolve(deliverablesForMonth);
                });
            return deferred.promise;
        }


        /**
         * @name deliverablesModel.filterDeliverablesForFiscalMonth
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @param {Object|Array} deliverables
         * @returns {Deliverable[]}  Array of deliverables for the month.
         */
        function filterDeliverablesForFiscalMonth(fiscalMonth, deliverables) {
            return _.where(deliverables, {fiscalMonth: fiscalMonth});
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
            if (deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id]) {
                /** Remove cached deliverable */
                delete deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id];
            }
        }

        /**
         * @name Deliverable.estimateDeliverableDueDate
         * @returns {Date} The due date or null if one isn't found.
         */
        function estimateDeliverableDueDate() {
            var deliverable = this;
            return deliverableFrequenciesService.estimateDeliverableDueDate(deliverable);
        }

        /**
         * @name deliverablesModel.getCachedDeliverablesByTypeId
         * @param {number} deliverableTypeId
         * @description Allows us to retrieve deliverables for a given definition which have already been
         * grouped/cache by definition id.
         * @returns {object} Keys of deliverable id and values of the deliverables themselves.
         */
        function getCachedDeliverablesByTypeId(deliverableTypeId) {
            return deliverableByTypeId[deliverableTypeId];
        }

        /**
         * @name Deliverable.startDateIsRelevant
         * @description We only need to show the start date field on ad-hoc type deliverables.
         * @returns {boolean}
         */
        function startDateIsRelevant() {
            var deliverable = this;
            var deliverableDefinition = deliverable.getDeliverableDefinition();
            var relevant = false;

            if (deliverableDefinition) {
                relevant = deliverableDefinition.deliverableFrequency === 'As Required';
            }
            return relevant;
        }

        /**
         * @name Deliverable.getDaysBetweenSubmittedAndDue
         * @returns {number} + = submitted early, - = submitted late
         */
        function getDaysBetweenSubmittedAndDue() {
            var deliverable = this;

            //TODO get this working once the current bug in moment-business is resolved
            //return moment(deliverable.dueDate).weekDays(moment(deliverable.submissionDate));

            //Number of actual days between dates
            var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            var firstDate = deliverable.dueDate || deliverable.estimateDeliverableDueDate();
            var secondDate = deliverable.submissionDate;

            var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));

            return secondDate < firstDate ? diffDays : -diffDays;
        }

        /**
         * @name Deliverable.wasDeliveredOnTime
         * @returns {boolean} Was this deliverable submitted by the due date?
         */
        function wasDeliveredOnTime() {
            var deliverable = this;
            return deliverable.getDaysBetweenSubmittedAndDue() >= 0;
        }

        /**
         * @name Deliverable.hasFeedback
         * @description Simple check to see if a given deliverable has any feedback.
         * @returns {boolean}
         */
        function hasFeedback() {
            var deliverable = this;
            /** Force a boolean response */
            return !!deliverable.getCachedFeedbackByDeliverableId();
        }

        /**
         * @name Deliverable.getRatingsAverage
         * @returns {number} Average of all ratings for this deliverable.
         */
        function getRatingsAverage() {
            var deliverable = this,
                ratingSum = 0,
                averageRating;
            var feedbackRecords = _.toArray(deliverable.getCachedFeedbackByDeliverableId());

            _.each(feedbackRecords, function (feedbackRecord) {
                ratingSum += feedbackRecord.rating;
            });
            if (!feedbackRecords.length) {
                /** Assume perfect score unless there are actual ratings */
                averageRating = 5;
            } else {
                averageRating = Math.round((ratingSum / feedbackRecords.length) * 10) / 10;
            }
            return averageRating;
        }

        /**
         * @name Deliverable.registerDeliverableAccessEvent
         * @description Creates a log entry the first time a user views a deliverable then modifies once they leave
         * so the delta from the two time will show how long they viewed the record.
         * @returns {promise}
         */
        function registerDeliverableAccessEvent() {
            var deliverable = this;
            return deliverableAccessLogModel.addNewItem({
                deliverable: {lookupId: deliverable.id},
                fy: deliverable.fy
            });
        }


        /**
         * @name Deliverable.getCachedAccessLogsByDeliverableId
         * @description Allows us to retrieve all feedback for a given deliverable which have already been
         * grouped/cached by deliverable id.
         * @returns {object} Keys of deliverable feedback id's and values of the feedback themselves.
         */
        function getCachedAccessLogsByDeliverableId() {
            var self = this;
            return deliverableAccessLogModel.getCachedLogByDeliverableId(self.id);
        }

        /**
         * @name Deliverable.getViewCount
         * @description Returns the number of times a given deliverable has been viewed.
         * @returns {Number}
         */
        function getViewCount() {
            var deliverable = this;
            var accessLogs = deliverable.getCachedAccessLogsByDeliverableId();
            return _.toArray(accessLogs).length;
        }

        function openFeedbackModal(overrides, feedback) {
            var deliverable = this;

            /** Get feedback and optionally extend with properties from the overrides object */
            var userFeedback = _.extend(feedback || deliverable.getCachedFeedbackForCurrentUser(), overrides);

            return userFeedback.openModal();
        }


    }
})();
