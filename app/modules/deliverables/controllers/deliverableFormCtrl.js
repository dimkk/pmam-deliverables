(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('deliverableFormCtrl', deliverableFormCtrl);

    /* @ngInject */
    function deliverableFormCtrl($scope, _, apDataService, deliverablesModel, deliverableDefinitionsModel,
                                 $location, $stateParams) {
        $scope.activate = activate;
        $scope.title = 'deliverableFormCtrl';

        activate();

        ////////////////

        function activate() {

        }

        //        var defaults = {
//            title: '',
//            type: {},
//            startdate: '',
//            submissiondate: '',
//            fy: '',
//            month: '',
//            details: '',
//            justification: '',
//            to: [],
//            cc: []
//        };
//        $scope.state = {
//            mode: 'new',
//            personnelArray: [],
//            dataReady: 'false'
//        };
//        $scope.cancel = cancel;
//        $scope.deliverableRecord = {};
//        $scope.deliverableDefinitions = [];
//        $scope.ok = ok;
//
//        function ok () {
//            if ($scope.deliverableRecord.id) {
//                //Existing health record being updated
//                $scope.deliverableRecord.saveChanges().then(function () {
//                    toastr.success("Health updated");
////                    $modalInstance.close();
//                }, function () {
//                    toastr.error("There was a problem updating this deliverable record");
//                });
//            } else {
//                //Create new health record
//                deliverablesModel.addNewItem($scope.deliverableRecord).then(function () {
//                    toastr.success("Health record saved");
////                    $modalInstance.close();
//                }, function () {
//                    toastr.error("There was a problem saving this record.  Please try again.");
//                });
//            }
//            $location.path("/deliverables");
//        }
//
//        function cancel() {
//            //Revert any changes
//            _.extend($scope.deliverableRecord, $scope.snapshot);
//            $location.path("/deliverables");
//        }
//
//        return $scope.ready.then(function (returnedArrays) {
//            if ($stateParams.id) {
//                $scope.state.mode = "edit";
//                $scope.deliverableRecord = deliverablesModel.findById($stateParams.id);
//                $scope.snapshot = angular.copy($scope.deliverableRecord);
//            }
//            else {
//                $scope.deliverableRecord = defaults;
//            }
//
//            _.each(deliverableDefinitionsModel.data, function (definition) {
//                $scope.deliverableDefinitions.push(definition);
//            });
//            _.each(usersModel.data, function (person) {
//                $scope.state.personnelArray.push(person);
//            });
//            $scope.state.dataReady = 'true';
//        });

    }
})();
