/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';


    var service;

    export interface IDeliverableFrequency {
        title:string;
        abbreviation:string;
        displayStartDate:boolean;
    }


    /**
     * @ngdoc service
     * @name deliverableFrequenciesService
     * @description
     *
     */
    export class DeliverableFrequenciesService {
        getFrequencies:IDeliverableFrequency[] = [
            {title: 'As Required', abbreviation: 'AR', displayStartDate: true},
            {title: 'Bimonthly', abbreviation: 'BM', displayStartDate: false},
            {title: 'Monthly', abbreviation: 'MO', displayStartDate: false},
            {title: 'One Time', abbreviation: 'OT', displayStartDate: false},
            {title: 'Quarterly', abbreviation: 'QT', displayStartDate: false},
            //Specified Dates is a potential option for the future but is not currently being used
            {title: 'Specified Dates', abbreviation: 'SD', displayStartDate: false}
        ];

        constructor(private calendarService) {
            service = this;
        }

        /**
         * @name deliverableFrequenciesService.estimateDeliverableDueDate
         * @param {Deliverable} deliverable Deliverable object.
         * @returns {Date} The due date or null if one isn't found.
         */
        estimateDeliverableDueDate(deliverable:Deliverable):Date {
            var deliverableDefinition:DeliverableDefinition = deliverable.getDeliverableDefinition(), dueDate;

            /** Support ad-hoc deliverables that are based on  */
            if (deliverableDefinition.deliverableFrequency === 'As Required') {
                /** Add the appropriate number of business days to the start date */
                dueDate = moment(deliverable.startDate).addWorkDays(deliverableDefinition.dateOffset).toDate();

            } else {
                /** Attempt to auto populate the due date based on current month and deliverable definition */
                var calendarMonth = deliverable.getCalendarMonth();
                var dueDatesForMonth = deliverableDefinition.getDeliverableDueDatesForMonth(calendarMonth);
                /** If there are multiple due dates for a given month, use the first - we don't have any definitions
                 * that require this functionality but we potentially could */
                if (_.isDate(dueDatesForMonth[0])) {
                    dueDate = dueDatesForMonth[0];
                }
            }

            return dueDate;
        }

        /**
         * @name calculateDeliverableDueDates
         * @param {DeliverableDefinition} deliverableDefinition
         * @returns {Array} of date objects.
         */
        generateDeliverableDueDates(deliverableDefinition:DeliverableDefinition):Date[] {
            var dueDates = [];

            /** Manually entered deliverable due dates override computed dates */
            if (deliverableDefinition.specifiedDates.length > 0) {
                /** Dates were manually entered so no need to compute */
                _.each(deliverableDefinition.specifiedDates, function (dateString) {
                    dueDates.push(new Date(dateString));
                });

            } else if (deliverableDefinition.dynamicDate) {
                /** Currently only a single dynamic date option 'LastDayOfMonth' but this will allow future expansion */
                switch (deliverableDefinition.dynamicDate) {

                    case 'LastDayOfMonth':
                        /** Build an array of dates for the last day of each month */
                        dueDates = service.processMonths(deliverableDefinition, function (calendarYear, i) {
                            /** Using zero for day sets date to last day of previous month, that is why we need i+1 */
                            return new Date(calendarYear, i + 1, 0);
                        });
                        break;
                }

            } else {
                /** Compute dates based on periodicity */
                switch (deliverableDefinition.deliverableFrequency) {
                    case 'Monthly':
                        dueDates = service.processMonths(deliverableDefinition, function (calendarMonth, i) {
                            /** Date identifier is numeric value as string which represents the day of month deliverable is due */
                            return new Date(calendarMonth, i + 1, deliverableDefinition.dayOfMonthDue);
                        });
                        break;
                    case 'Bimonthly':
                        dueDates = service.processMonths(deliverableDefinition, function (calendarMonth, i) {
                            /** Only add odd months */
                            if (i % 2) {
                                /** Create a due date for each odd month */
                                return new Date(calendarMonth, i + 1, deliverableDefinition.dayOfMonthDue);
                            }
                        });
                        break;
                }
            }

            return dueDates;
        }

        /**
         * @description Function that accepts a function and calls it for each of the 12 months
         * @param {DeliverableDefinition} deliverableDefinition
         * @param {function} evalMonth
         * @returns {Array}
         */
        processMonths(deliverableDefinition:DeliverableDefinition, evalMonth:Function) {
            var dueDates = [];

            for (var i = 0; i < 12; i++) {
                var calendarYear = service.calendarService.getCalendarYear(deliverableDefinition.fy, i);
                var dueDate = evalMonth(calendarYear, i);
                if (dueDate) {
                    dueDates.push(dueDate);
                }
            }
            return dueDates;
        }


    }


    angular
        .module('pmam-deliverables')
        .service('deliverableFrequenciesService', DeliverableFrequenciesService);

}
