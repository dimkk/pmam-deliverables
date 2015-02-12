(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('deliverableDefinitionModalController', deliverableDefinitionModalController);

    function deliverableDefinitionModalController($modalInstance, apModalService, deliverableDefinitionsModel, userService, deliverableDefinition) {
        var vm = this;

        vm.cancel = cancel;
        vm.deliverableDefinition = deliverableDefinition;
        vm.saveEntity = saveEntity;
        vm.state = apModalService.initializeState();

        activate();


        /**==================PRIVATE==================*/

        function activate() {
            /** Used to store primitives to pass as reference instead of value to child scopes */
            userService.getUserLookupValues()
                .then(function (personnelArray) {
                    vm.personnelArray = personnelArray;
                })
        }

        function saveEntity() {
            apModalService.saveEntity(vm.deliverableDefinition, deliverableDefinitionsModel, vm.state, $modalInstance);
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

    }
})();
