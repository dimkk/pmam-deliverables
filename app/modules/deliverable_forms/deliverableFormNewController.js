(function () {
    'use strict';

    // controller for handling new deliverable creation requests

    angular
        .module('pmam-deliverables')
        .controller('deliverableFormNewController', deliverableFormNewController);

    /* @ngInject */
    function deliverableFormNewController($scope, toastr, $state, deliverableDefinitionsModel, deliverablesModel,
                                          userService, calendarService) {

        var vm = this;
        var fiscalYear = isNaN($state.params.fy) ? calendarService.getCurrentFiscalYear() : parseInt($state.params.fy);
        var fiscalMonth = isNaN($state.params.mo) ? calendarService.getCurrentFiscalMonth() : parseInt($state.params.mo);

        vm.cancel = cancel;
        vm.dataReady = false;
        vm.monthOptions = calendarService.getMonthOptions();
        vm.save = save;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            /** Instantiate new deliverable record with default values */
            vm.deliverableRecord = deliverablesModel.createEmptyItem({
                fy: fiscalYear,
                fiscalMonth: fiscalMonth,
                startDate: new Date(),
                submissionDate: new Date()
            });

            deliverableDefinitionsModel.getFyDefinitions(vm.deliverableRecord.fy)
                .then(function (indexedCache) {
                    vm.deliverableTypes = indexedCache;
                    /** Check to see if a deliverable type was identified */
                    if ($state.params.deliverableTypeId) {
                        var deliverableTypeId = parseInt($state.params.deliverableTypeId);
                        setDeliverableDefaults(deliverableTypeId);
                    }

                    /** Add to scope so we can add watch which will update default when the type is changed */
                    $scope.observableDeliverableRecord = vm.deliverableRecord;
                    $scope.$watch('observableDeliverableRecord.deliverableType', function(newVal, oldVal) {
                        if(newVal && newVal !== oldVal && newVal.lookupId) {
                            setDeliverableDefaults(newVal.lookupId);
                        }
                    });

                });

            userService.getUserLookupValues()
                .then(function (result) {
                    vm.personnelArray = result;
                    vm.dataReady = true;
                });
        }

        function save() {
            vm.deliverableRecord.saveChanges()
                .then(function (newDeliverable) {
                    toastr.success("Deliverable updated");
                    $state.go('deliverable', {id: newDeliverable.id});
            }, function () {
                toastr.error("There was a problem creating this deliverable record");
            });
        }

        function cancel() {
            $state.go('deliverables.monthly', {
                mo: vm.deliverableRecord.fiscalMonth,
                fy: vm.deliverableRecord.fy
            });
        }

        function setDeliverableDefaults(deliverableTypeId) {

            var selectedDeliverableType = vm.deliverableTypes[deliverableTypeId];
            console.log(deliverableTypeId);

            if (selectedDeliverableType) {
                if(vm.deliverableRecord.deliverableType.lookupId !== deliverableTypeId) {
                    vm.deliverableRecord.deliverableType = {
                        lookupId: selectedDeliverableType.id,
                        lookupValue: selectedDeliverableType.title
                    };
                }

                /** Set default To and CC recipients */
                vm.deliverableRecord.to = selectedDeliverableType.to;
                vm.deliverableRecord.cc = selectedDeliverableType.cc;

                var estimatedDueDate = vm.deliverableRecord.estimateDeliverableDueDate();
                if(_.isDate(estimatedDueDate)) {
                    vm.deliverableRecord.dueDate = estimatedDueDate;
                }
            }
        }

    }
})();
