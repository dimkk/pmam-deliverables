(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .factory('deliverableFrequenciesService', deliverableFrequenciesService);

    /**
     * @ngdoc service
     * @name deliverableFrequenciesService
     * @description
     *
     */
    function deliverableFrequenciesService(calendarService) {
        var service = {
            estimateDeliverableDueDate: estimateDeliverableDueDate,
            generateDeliverableDueDates: generateDeliverableDueDates,
            getFrequencies: getFrequencies()
        };

        return service;

        /**==================PRIVATE==================*/

        function getFrequencies() {
            return [
                {title: 'As Required', abbreviation: 'AR', displayStartDate: true},
                {title: 'Bimonthly', abbreviation: 'BM', displayStartDate: false},
                {title: 'Monthly', abbreviation: 'MO', displayStartDate: false},
                {title: 'One Time', abbreviation: 'OT', displayStartDate: false},
                {title: 'Quarterly', abbreviation: 'QT', displayStartDate: false},
                //Specified Dates is a potential option for the future but is not currently being used
                {title: 'Specified Dates', abbreviation: 'SD', displayStartDate: false}
            ]
        }

        /**
         * @description Function that accepts a function and calls it for each of the 12 months
         * @param {DeliverableDefinition} deliverableDefinition
         * @param {function} evalMonth
         * @returns {Array}
         */
        function processMonths(deliverableDefinition, evalMonth) {
            var dueDates = [];

            for (var i = 0; i < 12; i++) {
                var calendarYear = calendarService.getCalendarYear(deliverableDefinition.fy, i);
                var dueDate = evalMonth(calendarYear, i);
                if (dueDate) {
                    dueDates.push(dueDate);
                }
            }
            return dueDates;
        }

        /**
         * @name calculateDeliverableDueDates
         * @param {DeliverableDefinition} deliverableDefinition
         * @returns {Array} of date objects.
         */
        function generateDeliverableDueDates(deliverableDefinition) {
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
                        dueDates = processMonths(deliverableDefinition, function (calendarYear, i) {
                            /** Using zero for day sets date to last day of previous month, that is why we need i+1 */
                            return new Date(calendarYear, i + 1, 0);
                        });
                        break;
                }

            } else {
                /** Compute dates based on periodicity */
                switch (deliverableDefinition.deliverableFrequency) {
                    case 'Monthly':
                        dueDates = processMonths(deliverableDefinition, function (calendarMonth, i) {
                            /** Date identifier is numeric value as string which represents the day of month deliverable is due */
                            return new Date(calendarMonth, i + 1, deliverableDefinition.dayOfMonthDue);
                        });
                        break;
                    case 'Bimonthly':
                        dueDates = processMonths(deliverableDefinition, function (calendarMonth, i) {
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
         * @name deliverableFrequenciesService.estimateDeliverableDueDate
         * @param {Deliverable} deliverable Deliverable object.
         * @returns {Date} The due date or null if one isn't found.
         */
        function estimateDeliverableDueDate(deliverable) {
            var deliverableDefinition = deliverable.getDeliverableDefinition(),
                dueDate = null;

            /** Support ad-hoc deliverables that are based on  */
            if(deliverableDefinition.deliverableFrequency === 'As Required') {
                /** Add the appropriate number of business days to the start date */
                dueDate = moment(deliverable.startDate).addWorkDays(deliverableDefinition.dateOffset).toDate();

            } else {
                /** Attempt to auto populate the due date based on current month and deliverable definition */
                var calendarMonth = deliverable.getCalendarMonth();
                var dueDatesForMonth = deliverableDefinition.getDeliverableDueDatesForMonth(calendarMonth);
                /** If there are multiple due dates for a given month, use the first - we don't have any definitions
                 * that require this functionality but we potentially could */
                if(_.isDate(dueDatesForMonth[0])) {
                    dueDate = dueDatesForMonth[0];
                }
            }

            return dueDate;
        }

    }
})();
