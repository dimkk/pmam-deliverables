/// <reference path="../../../typings/tsd.d.ts" />

module app.services {
    'use strict';

    export interface IDeliverable extends ap.ListItem{
        //estimateDeliverableDueDate(): ;
        //getCachedAccessLogsByDeliverableId(): ;
        //getCachedFeedbackByDeliverableId(): ;
        //getCachedFeedbackForCurrentUser(): ;
        //getCalendarMonth(): ;
        //getDaysBetweenSubmittedAndDue(): ;
        //getDeliverableDefinition(): ;
        //getRatingsAverage(): ;
        //getViewCount(): ;
        //hasFeedback(): ;
        //registerDeliverableAccessEvent(): ;
        //startDateIsRelevant(): ;
        //wasDeliveredOnTime(): ;

    }

    class Deliverable implements IDeliverable{
        constructor(obj) {
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
    }

    class DeliverablesModel implements IDeliverable {
        constructor() {

        }
    }

    angular
        .module('pmam-deliverables')
        .service('deliverablesModel', DeliverablesModel);
}
