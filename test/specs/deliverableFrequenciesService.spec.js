'use strict';

describe('Service: deliverableFrequenciesService', function () {
    var deliverableFrequenciesService, monthlyDefinition, biMonthlyDefinition, asRequiredDefinition,
        specifiedDatesDefinition, deliverablesModel, deliverableDefinitionsModel, apCacheService;


    beforeEach(module('pmam-deliverables'));

    beforeEach(inject(function ($injector) {

        // Set up the mock http service responses
        deliverableFrequenciesService = $injector.get('deliverableFrequenciesService');
        deliverablesModel = $injector.get('deliverablesModel');
        deliverableDefinitionsModel = $injector.get('deliverableDefinitionsModel');
        apCacheService = $injector.get('apCacheService');

        monthlyDefinition = deliverableDefinitionsModel.createEmptyItem({
            id: 1,
            deliverableFrequency: 'Monthly',
            dayOfMonthDue: 10,
            fy: 2015
        });
        apCacheService.registerEntity(monthlyDefinition);

        biMonthlyDefinition = deliverableDefinitionsModel.createEmptyItem({
            id: 2,
            deliverableFrequency: 'Bimonthly',
            dayOfMonthDue: 10,
            fy: 2015
        });

        apCacheService.registerEntity(biMonthlyDefinition);

        asRequiredDefinition = deliverableDefinitionsModel.createEmptyItem({
            id: 3,
            deliverableFrequency: 'As Required',
            dateOffset: 7,
            fy: 2015
        });

        apCacheService.registerEntity(asRequiredDefinition);

        specifiedDatesDefinition = deliverableDefinitionsModel.createEmptyItem({
            id: 4,
            deliverableFrequency: 'Specified Dates',
            fy: 2015,
            specifiedDates: ["2015-01-15", "2015-03-15"]
        });

        apCacheService.registerEntity(specifiedDatesDefinition);

    }));

    describe('Method: estimateDeliverableDueDate', function () {
        it('correctly estimates deliverable due date for a monthly deliverable.', function () {

            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 7,
                deliverableType: {lookupId: 1}
            });

            expect(deliverableFrequenciesService.estimateDeliverableDueDate(deliverable)).toEqual(new Date(2015, 3, 10));
        });

        it('returns the due date for a bi-monthly deliverable.', function () {

            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 8,
                deliverableType: {lookupId: 2}
            });

            expect(deliverableFrequenciesService.estimateDeliverableDueDate(deliverable)).toEqual(new Date(2015, 4, 10));
        });

        it('does not return a due date for a bi-monthly deliverable on an even month.', function () {

            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 7,
                deliverableType: {lookupId: 2}
            });

            expect(deliverableFrequenciesService.estimateDeliverableDueDate(deliverable)).toBeUndefined();
        });

        it('returns a valid date for a as required deliverable type.', function () {

            var deliverable = deliverablesModel.createEmptyItem({
                deliverableType: {lookupId: 3},
                fiscalMonth: 7,
                startDate: new Date(2015, 4, 10)
            });

            expect(deliverableFrequenciesService.estimateDeliverableDueDate(deliverable)).toEqual(new Date(2015, 4, 17));
        });

        it('returns a valid date on month where deliverable occurs at specific dates.', function () {

            var deliverable = deliverablesModel.createEmptyItem({
                deliverableType: {lookupId: 4},
                fiscalMonth: 4
            });

            expect(deliverableFrequenciesService.estimateDeliverableDueDate(deliverable)).toEqual(new Date(2015, 0, 15));
        });

        it('doesn\'t return anything on month where specific dates isn\'t set.', function () {

            var deliverable = deliverablesModel.createEmptyItem({
                deliverableType: {lookupId: 4},
                fiscalMonth: 3
            });

            expect(deliverableFrequenciesService.estimateDeliverableDueDate(deliverable)).toBeUndefined();
        });

    });

});
