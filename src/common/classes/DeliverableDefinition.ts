/// <reference path="../../../typings/tsd.d.ts" />

module app{
    export interface IDeliverableDefinition extends ap.ListItem {
        title?:string;
        deliverableNumber?:string;
        deliverableFrequency?:ap.Choice;
        dateIdentifier?:string;
        dayOfMonthDue?:number;
        dueDates?:Date[];
        dynamicDate?:ap.Choice;
        dateOffset?:number;
        fy?:number;
        frequencyDescription?:string;
        to?:ap.UserMulti;
        cc?:ap.UserMulti;
        taskNumber?:string;
        specifiedDates?:ap.JSON;


        getAllFeedback():IDeliverableFeedback[];
        getDeliverableDueDatesForMonth(zeroBasedMonthNumber:number):Date[];
        getDeliverablesForDefinition():{ [index:number]:IDeliverable };
        getExpectedDeliverableCount():number;
        getLateCount():number;
        getOnTimeCount():number;
        stakeholdersModal():ng.ui.bootstrap.IModalServiceInstance;
    }

    var DeliverableDefinitionsModel = app.DeliverableDefinitionsModel;

    export class DeliverableDefinition implements IDeliverableDefinition{
        dueDates;
        constructor(obj) {
            var self = this;
            _.extend(self, obj);
            /** Identify all due dates for this deliverable definition and store for later use */
            self.dueDates = DeliverableFrequenciesModel.deliverableFrequenciesService.generateDeliverableDueDates(self);
        }

        /**
         * @name DeliverableDefinition.getAllFeedback
         * @returns {IDeliverableFeedback[]} Array containing all feedback for all of the deliverables of this type.
         */
        getAllFeedback():IDeliverableFeedback[] {
            var deliverableDefinition = this;
            var deliverablesForDefinition = deliverableDefinition.getDeliverablesForDefinition();
            var feedbackForDefinition = [];
            _.each(deliverablesForDefinition, (deliverable) => {
                var feedback = _.toArray(deliverable.getCachedFeedbackByDeliverableId());
                Array.prototype.push.apply(feedbackForDefinition, feedback);
            });
            return feedbackForDefinition;
        }

        /**
         * @description Given a zero based month number, returns an array of due dates for the given month or an empty
         * array if there are no due dates for the month.
         * @param {number} zeroBasedMonthNumber Calendar month (0-11) in JS
         * @returns {Date[]}
         */
        getDeliverableDueDatesForMonth(zeroBasedMonthNumber:number):Date[] {
            var deliverableDefinition = this,
                deliverableDueDatesForMonth = [];
            _.each(deliverableDefinition.dueDates, (dueDate) => {
                if (dueDate.getMonth() == zeroBasedMonthNumber) {
                    deliverableDueDatesForMonth.push(dueDate);
                }
            });
            return deliverableDueDatesForMonth;
        }

        /**
         * @name DeliverableDefinition.getDeliverablesForDefinition
         * @description Allows us to retrieve deliverables for a given definition which have already been
         * grouped/cache by definition id.
         * @returns {object} Keys of deliverable id and values of the deliverables themselves.
         */
        getDeliverablesForDefinition():{ [index:number]:IDeliverable} {
            var deliverableDefinition = this;
            /* Need to manually inject with $injector because deliverablesModel already has this model as a
             * dependency and they can't each directly depend on the other or neither will instantiate */
            var deliverablesModel = $injector.get('deliverablesModel');
            return deliverablesModel.getCachedDeliverablesByTypeId(deliverableDefinition.id);
        }

        /**
         * @name DeliverableDefinition.getExpectedDeliverableCount
         * @description Returns the number of deliverables that should be in the system for the given definition
         * @returns {Number}
         */
        getExpectedDeliverableCount():number {
            var deliverableDefinition = this;
            var today = new Date();
            var expectedDueDates = _.where(deliverableDefinition.dueDates, (date) =>  date < today);
            return expectedDueDates.length;
        }

        /**
         * @name DeliverableDefinition.getLateCount
         * @returns {number} The number of deliverables that are still outstanding or were submitted after the due date
         * up to this point for the fiscal year.
         */
        getLateCount():number {
            var deliverableDefinition = this;
            var deliverablesForDefinition = _.toArray(deliverableDefinition.getDeliverablesForDefinition());

            /** The number of deliverables that still haven't been submitted */
            var missingDeliverableCount = deliverableDefinition.getExpectedDeliverableCount() - deliverablesForDefinition.length;
            /** Don't get extra credit for more deliverables than were supposed to be submitted so ignore negative number */
            var lateCount = missingDeliverableCount < 0 ? 0 : missingDeliverableCount;
            _.each(deliverablesForDefinition, (deliverable) => {
                if (!deliverable.wasDeliveredOnTime()) {
                    lateCount++;
                }
            });
            return lateCount;
        }

        /**
         * @name DeliverableDefinition.getOnTimeCount
         * @returns {number} The number of deliverables that were turned in by or on the due date
         */
        getOnTimeCount():number {
            var deliverableDefinition = this;
            var onTimeCount = 0;
            var deliverablesForDefinition = deliverableDefinition.getDeliverablesForDefinition();
            _.each(deliverablesForDefinition, function (deliverable) {
                if (deliverable.wasDeliveredOnTime()) {
                    onTimeCount++;
                }
            });
            return onTimeCount;
        }

        stakeholdersModal():ng.ui.bootstrap.IModalServiceInstance {
            var deliverableDefinition = this;
            return DeliverableDefinitionsModel.$modal.open({
                templateUrl: 'modules/deliverables/views/deliverableDefinitionModalView.html',
                controller: 'deliverableDefinitionModalController',
                controllerAs: 'vm',
                resolve: {
                    deliverableDefinition: () => deliverableDefinition
                }
            });
        }
    }

}
