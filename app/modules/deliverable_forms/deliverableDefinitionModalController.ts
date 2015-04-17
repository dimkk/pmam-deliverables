/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var vm:DeliverableDefinitionModalController;

    class DeliverableDefinitionModalController{
        cc;
        personnelArray:ap.IUser[];
        to;
        userCanEdit:boolean;
        constructor(private $modalInstance:angular.ui.bootstrap.IModalServiceInstance,
                    private userService:UserService, private toastr,
                    private deliverableDefinition:DeliverableDefinition) {
            vm = this;

            /** Create a working copy of the fields we're interested in so we don't polute local cache if user cancels */
            vm.to = angular.copy(deliverableDefinition.to);
            vm.cc = angular.copy(deliverableDefinition.cc);

            vm.activate();

        }
        activate() {

            /** Current user's permission for this definition */
            var userPermissions = vm.deliverableDefinition.resolvePermissions();
            vm.userCanEdit = userPermissions.EditListItems;


            vm.userService.getUserLookupValues()
                .then(function (personnelArray) {
                    vm.personnelArray = personnelArray;
                });
        }
        cancel() {
            vm.$modalInstance.dismiss('cancel');
        }
        save() {
            vm.deliverableDefinition.to = vm.to;
            vm.deliverableDefinition.cc = vm.cc;

            vm.deliverableDefinition.saveFields(['to','cc'])
                .then(function (updatedDefinition) {
                    vm.$modalInstance.close(updatedDefinition);
                    vm.toastr.success('Deliverable stakeholders successfully updated.');
                });
        }

    }

    angular
        .module('pmam-deliverables')
        .controller('deliverableDefinitionModalController', DeliverableDefinitionModalController);


}
