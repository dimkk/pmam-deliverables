/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var template = `<image src="images/imnoff.png" ng-src="{{ vm.imageUrl }}" alt="Deliverable Acceptability Stoplight" title="{{ vm.status }}"></image>`;

    function RatingStoplight() {
        return {
            controller: RatingStoplightController,
            controllerAs: 'vm',
            scope: {
                deliverable: '='
            },
            template: template
        };
    }

    class RatingStoplightController{
        imageUrl = 'images/imnoff.png';
        status = 'No reviews have been submitted for this deliverable.';
        constructor($scope:{deliverable:Deliverable}) {
            var vm = this,
                deliverable = $scope.deliverable,
                acceptableCount = 0;
            switch (deliverable.getAcceptableStatus())
            {
                case "Acceptable":
                    vm.imageUrl = 'images/imnon.png';
                    vm.status = 'This deliverable has been rated as acceptable.';
                    break;
                case "Unacceptable":
                    vm.imageUrl = 'images/imnbusy.png';
                    vm.status = 'This deliverable has been rated as unacceptable.';
                    break;
                case "Not Rated":
                    vm.imageUrl = 'images/imnoff.png';
                    vm.status = 'No reviews have been submitted for this deliverable.';
                    break;
                default:
                    vm.imageUrl = 'images/imnaway.png';
                    vm.status = 'This deliverable has been rated as both acceptable and unacceptable by different reviewers.';
                    break;
            }
        }
     
    }


    angular
        .module('pmam-deliverables')
        .directive('ratingStoplight', RatingStoplight);

}
