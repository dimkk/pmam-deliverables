/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var model:DeliverablesModel, $q, apDiscussionThreadFactory, deliverableFeedbackModel:DeliverableFeedbackModel,
        deliverableDefinitionsModel:DeliverableDefinitionsModel, calendarService:CalendarService,
        deliverableFrequenciesService:DeliverableFrequenciesService, user:IUser,
        deliverableAccessLogModel:DeliverableAccessLogModel, userService:UserService;

    /**
     * @ngdoc function
     * @name deliverablesModel.Deliverable
     * @description
     * Entity Constructor
     * @param {object} obj New entity to extend.
     * @constructor
     */
    export class Deliverable extends ap.ListItem {
        attachments:string[];
        cc:ap.IUser[];
        deliverableType:ap.ILookup;
        details:string;
        discussionThread:ap.IDiscussionThread;
        displayDate:string; //Calculated
        dueDate:Date;
        fiscalMonth:number;
        fy:number;
        justification:string;
        stakeholdersNotified:boolean;
        startDate:Date;
        submissionDate:Date;
        title:string;
        to:ap.IUser[];

        _deleteItem();

        constructor(obj) {
            super();
            var self = this;
            _.assign(self, obj);
            self.displayDate = moment(self.submissionDate).format('MMM YY');
            /** Instantiate a new discussion object even if there isn't an active discussion */
            self.discussionThread = apDiscussionThreadFactory.createDiscussionObject(self, 'discussionThread');

            /** Store in cached object so we can reference by deliverable type directly from the type without needing to iterate over anything*/
            model.registerDeliverableByType(self);
            /** Modify standard prototype delete logic so we can remove from cache prior to actually deleting */
            self._deleteItem = self.deleteItem;
            self.deleteItem = () => {
                model.removeDeliverableByType(self);
                return self._deleteItem();
            }
        }

        /**
         * @name Deliverable.estimateDeliverableDueDate
         * @returns {Date} The due date or null if one isn't found.
         */
        estimateDeliverableDueDate() {
            return deliverableFrequenciesService.estimateDeliverableDueDate(this);
        }

        /**
         * @name Deliverable.getCachedAccessLogsByDeliverableId
         * @description Allows us to retrieve all feedback for a given deliverable which have already been
         * grouped/cached by deliverable id.
         * @returns {object} Keys of deliverable feedback id's and values of the feedback themselves.
         */
        getCachedAccessLogsByDeliverableId() {
            return deliverableAccessLogModel.getCachedLogByDeliverableId(this.id);
        }

        /**
         * @name Deliverable.getCachedFeedbackByDeliverableId
         * @description Allows us to retrieve all feedback for a given deliverable which have already been
         * grouped/cached by deliverable id.
         * @returns {object} Keys of deliverable feedback id's and values of the feedback themselves.
         */
        getCachedFeedbackByDeliverableId():ap.IIndexedCache<DeliverableFeedback> {
            return deliverableFeedbackModel.getCachedFeedbackByDeliverableId(this.id);
        }

        /**
         * @name Deliverable.getCachedFeedbackForCurrentUser
         * @returns {deliverableFeedbackModel.DeliverableFeedback} Either an existing feedback record or empty record.
         */
        getCachedFeedbackForCurrentUser():DeliverableFeedback {
            var self = this, feedbackForUser,
                feedbackForDeliverable = self.getCachedFeedbackByDeliverableId();
            if (feedbackForDeliverable) {
                _.each(feedbackForDeliverable, (feedback:DeliverableFeedback) => {
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
         * @name Deliverable.getCalendarMonth
         * @description Month is the FY Month (1-12), method converts into calendar month (0-11)
         * @returns {number} Integer 0-11
         */
        getCalendarMonth() {
            return calendarService.getCalendarMonth(this.fiscalMonth);
        }

        /**
         * @name Deliverable.getDaysBetweenSubmittedAndDue
         * @returns {number} + = submitted early, - = submitted late
         */
        getDaysBetweenSubmittedAndDue() {
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
         * @name Deliverable.getDeliverableDefinition
         * @description Adds ability to reference the deliverable definition directly from any deliverable object
         * @returns {deliverableDefinitionsModel.factory} DeliverableDefinition
         */
        getDeliverableDefinition(): DeliverableDefinition {
            return deliverableDefinitionsModel.getCachedEntity(this.deliverableType.lookupId);
        }

        /**
         * @name Deliverable.getRatingsAverage
         * @returns {number} Average of all ratings for this deliverable.
         */
        getRatingsAverage():number {
            var deliverable = this,
                ratingSum = 0,
                averageRating;
            var feedbackRecords = _.toArray(deliverable.getCachedFeedbackByDeliverableId());

            _.each(feedbackRecords, (feedbackRecord) => {
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
         * @name Deliverable.getViewCount
         * @description Returns the number of times a given deliverable has been viewed.
         * @returns {Number}
         */
        getViewCount(): number {
            var deliverable = this;
            var accessLogs = deliverable.getCachedAccessLogsByDeliverableId();
            return _.toArray(accessLogs).length;
        }

        /**
         * @name Deliverable.hasFeedback
         * @description Simple check to see if a given deliverable has any feedback.
         * @returns {boolean}
         */
        hasFeedback():boolean {
            /** Force a boolean response */
            return !!this.getCachedFeedbackByDeliverableId();
        }

        openFeedbackModal(overrides, feedback) {
            var deliverable = this;

            /** Get feedback and optionally extend with properties from the overrides object */
            var userFeedback = _.assign(feedback || deliverable.getCachedFeedbackForCurrentUser(), overrides);

            return userFeedback.openModal();
        }

        /**
         * @name Deliverable.registerDeliverableAccessEvent
         * @description Creates a log entry the first time a user views a deliverable then modifies once they leave
         * so the delta from the two time will show how long they viewed the record.
         * @returns {promise}
         */
        registerDeliverableAccessEvent():ng.IPromise<DeliverableAccessLog> {
            var deliverable = this;
            var newEvent = deliverableAccessLogModel.createEmptyItem({
                deliverable: {lookupId: deliverable.id},
                fy: deliverable.fy
            });
            return newEvent.saveChanges();
        }

        /**
         * @name Deliverable.startDateIsRelevant
         * @description We only need to show the start date field on ad-hoc type deliverables.
         * @returns {boolean}
         */
        startDateIsRelevant():boolean {
            var deliverable = this;
            var deliverableDefinition = deliverable.getDeliverableDefinition();
            var relevant = false;

            if (deliverableDefinition) {
                relevant = deliverableDefinition.deliverableFrequency === 'As Required';
            }
            return relevant;
        }

        userCanReview = userService.userCanReview;

        /**
         * @name Deliverable.wasDeliveredOnTime
         * @returns {boolean} Was this deliverable submitted by the due date?
         */
        wasDeliveredOnTime():boolean {
            var deliverable = this;
            return deliverable.getDaysBetweenSubmittedAndDue() >= 0;
        }

    }

    export class DeliverablesModel extends ap.Model{
        /** Local Deliverable cache organized by deliverable type id */
        deliverableByTypeId = {};

        constructor(_$q_, _apDiscussionThreadFactory_, _deliverableFeedbackModel_:DeliverableFeedbackModel,
                    _deliverableDefinitionsModel_, _calendarService_, _deliverableFrequenciesService_, _user_,
                    _deliverableAccessLogModel_, _userService_, ListItemFactory, ModelFactory) {

            $q = _$q_;
            apDiscussionThreadFactory = _apDiscussionThreadFactory_;
            calendarService = _calendarService_;
            deliverableAccessLogModel = _deliverableAccessLogModel_;
            deliverableDefinitionsModel = _deliverableDefinitionsModel_;
            deliverableFeedbackModel = _deliverableFeedbackModel_;
            deliverableFrequenciesService = _deliverableFrequenciesService_;
            user = _user_;
            userService = _userService_;


            model = this;
            /********************* Model Definition ***************************************/

            /**
             * @ngdoc object
             * @name deliverablesModel
             * @description
             *  Model Constructor
             */
            super({
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
                        {
                            staticName: 'Attachments',
                            objectType: 'Attachments',
                            mappedName: 'attachments',
                            readOnly: true
                        }

                    ]
                }
            });

        }

        /**
         * @name deliverablesModel.filterDeliverablesForFiscalMonth
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @param {Object|Array} deliverables
         * @returns {Deliverable[]}  Array of deliverables for the month.
         */
        filterDeliverablesForFiscalMonth(fiscalMonth:number, deliverables:ap.IIndexedCache<Deliverable>):Deliverable[] {
            return _.filter(deliverables, {fiscalMonth: fiscalMonth});
        }


        /**
         * @name deliverablesModel.getCachedDeliverablesByTypeId
         * @param {number} deliverableTypeId
         * @description Allows us to retrieve deliverables for a given definition which have already been
         * grouped/cache by definition id.
         * @returns {object} Keys of deliverable id and values of the deliverables themselves.
         */
        getCachedDeliverablesByTypeId(deliverableTypeId: number): ap.IIndexedCache<Deliverable> {
            return model.deliverableByTypeId[deliverableTypeId];
        }

        /**
         * @name deliverablesModel.getDeliverablesForMonth
         * @param {number} fiscalYear Fiscal Year (October - September)
         * @param {number} fiscalMonth Fiscal Month (1 - 12 starting with October)
         * @returns {promise} object[]
         */
        getDeliverablesForMonth(fiscalYear: number, fiscalMonth: number):ng.IPromise<Deliverable[]> {

            var deferred = $q.defer();

            model.getFyDeliverables(fiscalYear)
                .then(function (indexedCache) {
                    var deliverablesForMonth = model.filterDeliverablesForFiscalMonth(fiscalMonth, indexedCache);
                    deferred.resolve(deliverablesForMonth);
                });
            return deferred.promise;
        }

        /**
         * @name deliverablesModel.getFyDeliverables
         * @param {number} fy Fiscal year.
         * @description
         * @returns {*|Object}
         */
        getFyDeliverables(fy: number): ng.IPromise<ap.IIndexedCache<Deliverable>> {
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

        registerDeliverableByType(deliverable: Deliverable): void {
            if (deliverable.deliverableType.lookupId) {
                model.deliverableByTypeId[deliverable.deliverableType.lookupId] = model.deliverableByTypeId[deliverable.deliverableType.lookupId] || {};
                /** Only register modifications that have been saved to the server and add to cache if not already there */
                if (deliverable.id && !model.deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id]) {
                    model.deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id] = deliverable;
                }
            }
        }

        removeDeliverableByType(deliverable: Deliverable): void {
            if (model.deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id]) {
                /** Remove cached deliverable */
                delete model.deliverableByTypeId[deliverable.deliverableType.lookupId][deliverable.id];
            }
        }


    }

    angular
        .module('pmam-deliverables')
        .service('deliverablesModel', DeliverablesModel);

}
