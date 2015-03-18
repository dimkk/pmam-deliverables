(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('feedbackModalController', feedbackModalController);

    /* @ngInject */
    function feedbackModalController(userFeedback, isAuthor, $modalInstance, userService, toastr, deliverablesModel) {
        var vm = this;
        vm.userFeedback = userFeedback;

        vm.cancel = cancel;
        vm.deleteFeedback = deleteFeedback;
        vm.negotiatingWithServer = false;
        vm.save = save;

        activate();


        /**==================PRIVATE==================*/

        function activate() {
            vm.fullControl = userService.userIsAdmin();
            /** Admins and user who created feedback can edit and delete */
            vm.userCanEdit = vm.fullControl || isAuthor;
            vm.userCanDelete = vm.userFeedback.id && vm.userCanEdit;
            vm.deliverable = deliverablesModel.getCachedEntity(vm.userFeedback.deliverable.lookupId);
        }

        function save() {
            if(validate()) {
                vm.negotiatingWithServer = true;
                vm.userFeedback.saveChanges()
                    .then(function (updatedFeedback) {
                        $modalInstance.close(updatedFeedback);
                    });
            }
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

        function deleteFeedback() {
            vm.userFeedback.deleteItem()
                .then(function () {
                    $modalInstance.close();
                });
        }

        function validate() {
            var isValid = true;
            if(vm.userFeedback.acceptable === null) {
                toastr.warning('Please provide an acceptability rating for this deliverable.');
                isValid = false;
            } else if(!vm.userFeedback.acceptable && vm.userFeedback.comments.length === 0) {
                toastr.warning('Please provide comments as to why this deliverable is unacceptable.');
                isValid = false;
            }
            return isValid;
        }
    }
})();
