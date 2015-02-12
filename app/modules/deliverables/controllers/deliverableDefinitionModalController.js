(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('deliverableDefinitionModalController', deliverableDefinitionModalController);

    function deliverableDefinitionModalController($modalInstance, userService, toastr, deliverableDefinition) {
        var vm = this;

        vm.cancel = cancel;
        vm.save = save;

        /** Create a working copy of the fields we're interested in so we don't polute local cache if user cancels */
        vm.to = angular.copy(deliverableDefinition.to);
        vm.cc = angular.copy(deliverableDefinition.cc);

        activate();


        /**==================PRIVATE==================*/

        function activate() {

            /** Current user's permission for this definition */
            var userPermissions = deliverableDefinition.resolvePermissions();
            vm.userCanEdit = userPermissions.EditListItems;


            userService.getUserLookupValues()
                .then(function (personnelArray) {
                    vm.personnelArray = personnelArray;
                });
        }

        function save() {
            deliverableDefinition.to = vm.to;
            deliverableDefinition.cc = vm.cc;

            deliverableDefinition.saveFields(['to','cc'])
                .then(function (updatedDefinition) {
                    $modalInstance.close(updatedDefinition);
                    toastr.success('Deliverable stakeholders successfully updated.');
                });
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

    }
})();
