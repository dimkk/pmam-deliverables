/// <reference path="../../../typings/tsd.d.ts" />

module app {
    'use strict';

    export interface IDeliverable extends IListItem {
        title?:string;
        deliverableType?:ap.Lookup;
        startDate?:Date;
        submissionDate?:Date;
        dueDate?:Date;
        fy?:boolean;
        fiscalMonth?:number;
        details?:string;
        justification?:string;
        to?:ap.UserMulti;
        cc?:ap.UserMulti;
        discussionThread?:ap.DiscussionThread;
        stakeholdersNotified?:boolean;
        attachments?:ap.Attachments;
        displayDate?:string;


        _deleteItem?(options?:ap.ListItemCrudOptions): ng.IDeferred<any>;
        estimateDeliverableDueDate():Date;
        getCachedAccessLogsByDeliverableId():{ [key: number]: IDeliverableFeedback; };
        getCachedFeedbackByDeliverableId():{ [key: number]: IDeliverableFeedback; };
        getCachedFeedbackForCurrentUser():IDeliverableFeedback;
        getCalendarMonth():number;
        getDaysBetweenSubmittedAndDue():number
        getDeliverableDefinition():IDeliverableDefinition;
        getRatingsAverage():number
        getViewCount():number;
        hasFeedback():boolean;
        registerDeliverableAccessEvent():ng.IPromise<IDeliverableAccessLog>;
        startDateIsRelevant():boolean;
        wasDeliveredOnTime():boolean;
    }

    var model;

    export class Deliverable extends ListItem implements IDeliverable {
        title;
        deliverableType;
        startDate;
        submissionDate;
        dueDate;
        fy;
        fiscalMonth;
        details;
        justification;
        to;
        cc;
        discussionThread;
        stakeholdersNotified;
        attachments;
        displayDate;
        _deleteItem;

        constructor(obj) {
            var self = this;
            _.extend(self, obj);
            self.displayDate = moment(self.submissionDate).format('MMM YY');
            model = model || this.getModel();

            /** Instantiate a new discussion object even if there isn't an active discussion */
            self.discussionThread = model.apDiscussionThreadFactory.createDiscussionObject(self, 'discussionThread');

            /** Store in cached object so we can reference by deliverable type directly from the type without needing to iterate over anything*/
            model.registerDeliverableByType(self);
            /** Modify standard prototype delete logic so we can remove from cache prior to actually deleting */
            self._deleteItem = self.deleteItem;
            self.deleteItem = () => {
                model.removeDeliverableByType(self);
                return self._deleteItem();
            }
            super();
        }

        /**
         * @name Deliverable.estimateDeliverableDueDate
         * @returns {Date} The due date or null if one isn't found.
         */
        estimateDeliverableDueDate():Date {
            var deliverable = this;
            return model.deliverableFrequenciesService.estimateDeliverableDueDate(deliverable);
        }

        /**
         * @name Deliverable.getCachedAccessLogsByDeliverableId
         * @description Allows us to retrieve all feedback for a given deliverable which have already been
         * grouped/cached by deliverable id.
         * @returns {object} Keys of deliverable feedback id's and values of the feedback themselves.
         */
        getCachedAccessLogsByDeliverableId():{ [key: number]: IDeliverableFeedback; } {
            var self = this;
            return model.deliverableAccessLogsModel.getCachedLogByDeliverableId(self.id);
        }

        /**
         * @name Deliverable.getCachedFeedbackByDeliverableId
         * @description Allows us to retrieve all feedback for a given deliverable which have already been
         * grouped/cached by deliverable id.
         * @returns {object} Keys of deliverable feedback id's and values of the feedback themselves.
         */
        getCachedFeedbackByDeliverableId():{ [key: number]: IDeliverableFeedback; } {
            var self = this;
            return model.deliverableFeedbackModel.getCachedFeedbackByDeliverableId(self.id);
        }

        /**
         * @name Deliverable.getCachedFeedbackForCurrentUser
         * @returns {deliverableFeedbackModel.DeliverableFeedback} Either an existing feedback record or empty record.
         */
        getCachedFeedbackForCurrentUser():IDeliverableFeedback {
            var self = this, feedbackForUser,
                feedbackForDeliverable = self.getCachedFeedbackByDeliverableId();
            if (feedbackForDeliverable) {
                _.each(feedbackForDeliverable, (feedback:IDeliverableFeedback) => {
                    if (feedback.author.lookupId === model.user.lookupId) {
                        feedbackForUser = feedback;
                    }
                });
            }
            /** Create a placeholder if one is found */
            if (!feedbackForUser) {
                var deliverableDefinition = self.getDeliverableDefinition();
                feedbackForUser = model.deliverableFeedbackModel.createEmptyItem({
                    acceptable: true,
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
        getCalendarMonth():number {
            var deliverable = this;
            return model.calendarService.getCalendarMonth(deliverable.fiscalMonth);
        }

        /**
         * @name Deliverable.getDaysBetweenSubmittedAndDue
         * @returns {number} + = submitted early, - = submitted late
         */
        getDaysBetweenSubmittedAndDue():number {
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
        getDeliverableDefinition():IDeliverableDefinition {
            var self = this;
            return model.deliverableDefinitionsModel.getCachedEntity(self.deliverableType.lookupId);
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
        getViewCount():number {
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
            var deliverable = this;
            /** Force a boolean response */
            return !!deliverable.getCachedFeedbackByDeliverableId();
        }

        /**
         * @name Deliverable.registerDeliverableAccessEvent
         * @description Creates a log entry the first time a user views a deliverable then modifies once they leave
         * so the delta from the two time will show how long they viewed the record.
         * @returns {promise}
         */
        registerDeliverableAccessEvent():ng.IPromise<IDeliverableAccessLog> {
            var deliverable = this;
            return model.deliverableAccessLogsModel.addNewItem({
                deliverable: {lookupId: deliverable.id},
                fy: deliverable.fy
            });
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

        /**
         * @name Deliverable.wasDeliveredOnTime
         * @returns {boolean} Was this deliverable submitted by the due date?
         */
        wasDeliveredOnTime():boolean {
            var deliverable = this;
            return deliverable.getDaysBetweenSubmittedAndDue() >= 0;
        }


    }
}
