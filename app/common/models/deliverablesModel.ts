/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    //TODO Add apIndexedCacheService to handle caching deliverables by type

    var $q,
        apDiscussionThreadFactory,
        calendarService: CalendarService,
        deliverableAccessMetricsModel: DeliverableAccessMetricsModel,
        deliverableDefinitionsModel: DeliverableDefinitionsModel,
        deliverableFeedbackModel: DeliverableFeedbackModel,
        deliverableFrequenciesService: DeliverableFrequenciesService,
        deliverableNotificationsModel: DeliverableNotificationsModel,
        model: DeliverablesModel,
        user: IUser,
        userService: UserService;

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
        dueDate:Date;
        fiscalMonth:number;
        fy:number;
        justification:string;
        stakeholderNotificationDate:Date;
        startDate:Date;
        submissionDate:Date;
        title:string;
        to:ap.IUser[];

        _deleteItem();

        constructor(obj) {
            _.assign(this, obj);

            /** Instantiate a new discussion object even if there isn't an active discussion */
            this.discussionThread = apDiscussionThreadFactory.createDiscussionObject(this, 'discussionThread');

            /** Store in cached object so we can reference by deliverable type directly from the type without needing to iterate over anything*/
            model.registerDeliverableByType(this);
            /** Modify standard prototype delete logic so we can remove from cache prior to actually deleting */
            this._deleteItem = this.deleteItem;
            this.deleteItem = () => {
                model.removeDeliverableByType(this);
                return this._deleteItem();
            }
        }

        get displayDate(): string {
            return moment(this.submissionDate).format('MMM YY');
        }

        /**
         * @name Deliverable.estimateDeliverableDueDate
         * @returns {Date} The due date or null if one isn't found.
         */
        estimateDeliverableDueDate() {
            return deliverableFrequenciesService.estimateDeliverableDueDate(this);
        }

        /**
         * @name Deliverable.generateNewDeliverableNotification
         * @returns {IPromise<TResult>}
         */
         generateNewDeliverableNotification():ng.IPromise<void> {
            var emailPromise = deliverableNotificationsModel.generateNewDeliverableNotification(this);

            /** Log date/time email generated and prevent future notifications from being generated. */
            emailPromise.then( () => {
                this.stakeholderNotificationDate = new Date();
                this.saveChanges();
            });
            return emailPromise;
        }

        /**
         * @description Returns the Access Metric record for a given deliverable if it exists.
         * @returns {DeliverableAccessMetric}
         */
        getCachedAccessMetrics(): DeliverableAccessMetric {
            return deliverableAccessMetricsModel.getCachedAccessMetricsByDeliverableId(this.id);
        }

        /**
         * @name Deliverable.getCachedFeedbackByDeliverableId
         * @description Allows us to retrieve all feedback for a given deliverable which have already been
         * grouped/cached by deliverable id.
         * @returns {ap.IIndexedCache<DeliverableFeedback>|DeliverableFeedback[]} Keys of deliverable feedback id's and values of the feedback themselves.
         */
        getCachedFeedbackByDeliverableId(asObject?:boolean):ap.IIndexedCache<DeliverableFeedback> | DeliverableFeedback[] {
            return deliverableFeedbackModel.getCachedFeedbackByDeliverableId(this.id, asObject);
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

            var firstDate = deliverable.dueDate || deliverable.estimateDeliverableDueDate();
            if(!firstDate) {
                throw 'A valid due date could not be found.';
            }
            var secondDate = deliverable.submissionDate || moment().startOf('day').toDate();

            return moment(firstDate).diff(moment(secondDate), 'days', false);
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
         * @name Deliverable.getViewCount
         * @description Returns the number of times a given deliverable has been viewed.
         * @returns {Number}
         */
        getViewCount(): number {
            var metricRecord = this.getCachedAccessMetrics();
            return metricRecord ? metricRecord.accessEvents.length : 0;
        }

        /**
         * @name Deliverable.hasFeedback
         * @description Simple check to see if a given deliverable has any feedback.
         * @returns {boolean}
         */
        hasFeedback():boolean {
            /** Force a boolean response */
            return this.getCachedFeedbackByDeliverableId(true).count() > 0;
        }

        openFeedbackModal(overrides, feedback) {
            var deliverable = this;

            /** Get feedback and optionally extend with properties from the overrides object */
            var userFeedback = _.assign(feedback || deliverable.getCachedFeedbackForCurrentUser(), overrides);

            return userFeedback.openModal();
        }

        /**
         * @name Deliverable.registerDeliverableAccessEvent
         * @description Creates a log entry so we can collect metrics on frequency and duration for the given deliverable.
         * @returns {promise}
         */
        registerDeliverableAccessEvent(opened: Date, closed: Date): ng.IPromise<DeliverableAccessMetric> {
            var deliverable = this;
            var metricRecord: DeliverableAccessMetric = this.getCachedAccessMetrics() || deliverableAccessMetricsModel.createEmptyItem({
                    accessEvents: [],
                deliverable: {lookupId: deliverable.id},
                fy: deliverable.fy
            });
            return metricRecord.registerAccessEvent(opened, closed);
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

        userCanContribute = userService.userCanContribute;
        userCanReview = userService.userCanReview;

        /**
         * @name Deliverable.wasDeliveredOnTime
         * @returns {boolean} Was this deliverable submitted by the due date?
         */
        wasDeliveredOnTime():boolean {
            var deliverable = this;
            return deliverable.getDaysBetweenSubmittedAndDue() >= 0;
        }
        getAcceptableStatus(): string {
            var deliverable = this;
            var acceptableCount = 0;
            var status = 'Not Rated';
            deliverableFeedbackModel.getFyFeedback(deliverable.fy);
            var feedbackRecords = _.toArray(deliverable.getCachedFeedbackByDeliverableId());
            
            /** Increment for each feedback marked as acceptable */
            _.each(feedbackRecords, function (feedbackRecord) {
                if (feedbackRecord.acceptable) {
                    acceptableCount++;
                }
            });

            if (feedbackRecords.length > 0) {
                if (feedbackRecords.length === acceptableCount) {
                    /** All Acceptable */
                    status = 'Acceptable';
                } else if (acceptableCount === 0) {
                    /** All unacceptable */
                    status = 'Unacceptable';
                } else {
                    /** Combination of acceptable and unacceptable */
                    status = 'Conflicted';
                }
            }

            return status;
        }

    }

    export class DeliverablesModel extends ap.Model{
        /** Local Deliverable cache organized by deliverable type id */
        deliverableByTypeId = {};

        constructor($injector) {

            $q = $injector.get('$q');
            apDiscussionThreadFactory = $injector.get('apDiscussionThreadFactory');
            calendarService = $injector.get('calendarService');
            //deliverableAccessLogModel = $injector.get('deliverableAccessLogModel');
            deliverableAccessMetricsModel = $injector.get('deliverableAccessMetricsModel');
            deliverableDefinitionsModel = $injector.get('deliverableDefinitionsModel');
            deliverableFeedbackModel = $injector.get('deliverableFeedbackModel');
            deliverableFrequenciesService = $injector.get('deliverableFrequenciesService');
            deliverableNotificationsModel = $injector.get('deliverableNotificationsModel');
            user = $injector.get('user');
            userService = $injector.get('userService');



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
                        {
                            staticName: 'StakeholderNotificationDate',
                            objectType: 'DateTime',
                            mappedName: 'stakeholderNotificationDate',
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
        filterDeliverablesForFiscalMonth(fiscalMonth: number, deliverables: ap.IIndexedCache<Deliverable>, selectedTask? : string): Deliverable[]{
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
        * @name deliverablesModel.getCachedDeliverablesByTypeId
        * @param {number} deliverableTypeId
        * @description Allows us to retrieve deliverables for a given definition which have already been
        * grouped/cache by definition id.
        * @returns {object} Keys of deliverable id and values of the deliverables themselves.
        */
        getCachedDeliverablesByDefinitions(deliverableDefinitions: DeliverableDefinition[]): ap.IIndexedCache<Deliverable> {
            var deliverables= [];

            _.each(deliverableDefinitions, (definition) => {
                if (definition.id) {
                    var d = model.deliverableByTypeId[definition.id];
                    if (d) {
                        _.each(d, (childDeliverable) => {
                            deliverables.push(childDeliverable);
                        });

                    }
                }
            });
            return deliverables;
            //return model.deliverableByTypeId[deliverableTypeId];
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
                .then((indexedCache) => {
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
