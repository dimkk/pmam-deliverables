/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var vm:DeliverableFormNewController;
    // controller for handling new deliverable creation requests

    interface IStateParams extends angular.ui.IStateParamsService{
        fy?:string;
        mo?:string;
        deliverableTypeId?:string;
    }

    class DeliverableFormNewController{
        deliverableTypes:ap.IIndexedCache<DeliverableDefinition>;
        dataReady = false;
        monthOptions:{number:number; label:string}[];
        personnelArray:ap.IUser[];
        constructor(private deliverableRecord:Deliverable,
                    $scope:ng.IScope, private toastr, private $state:angular.ui.IStateService,
                    $stateParams:IStateParams,
                    private deliverableDefinitionsModel:DeliverableDefinitionsModel,
                    userService:UserService, calendarService:CalendarService) {

            vm = this;
            vm.monthOptions = calendarService.getMonthOptions();

            deliverableDefinitionsModel.getFyDefinitions(vm.deliverableRecord.fy)
                .then(function (indexedCache) {
                    vm.deliverableTypes = indexedCache;
                    /** Check to see if a deliverable type was identified */
                    if ($stateParams.deliverableTypeId) {
                        var deliverableTypeId = parseInt($stateParams.deliverableTypeId);
                        setDeliverableDefaults(deliverableTypeId);
                    }

                    /** Add to scope so we can add watch which will update default when the type is changed */
                    $scope.$watch('vm.deliverableRecord.deliverableType', function(newVal, oldVal) {
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




            /**==================PRIVATE==================*/
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
        cancel() {
            vm.$state.go('deliverables.monthly', {
                mo: vm.deliverableRecord.fiscalMonth,
                fy: vm.deliverableRecord.fy
            });
        }

        save() {
            vm.deliverableRecord.saveChanges()
                .then(function (newDeliverable) {
                    vm.toastr.success("Deliverable updated");
                    vm.$state.go('deliverable', {id: newDeliverable.id});
                }, function () {
                    vm.toastr.error("There was a problem creating this deliverable record");
                });
        }

    }

    angular
        .module('pmam-deliverables')
        .controller('deliverableFormNewController', DeliverableFormNewController);


}
