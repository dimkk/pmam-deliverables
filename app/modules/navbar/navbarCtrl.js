'use strict';

angular.module('pmam-deliverables')
    .controller('navbarCtrl', function ($scope, $state, $location, _) {
        $scope.navLocations = [
           {label: 'Schedule', state: 'deliverables.main', iconClass: 'fa-calendar'},
           {label: 'Deliverables', state: 'deliverables.instances', iconClass: 'fa-search'},
           {label: 'Deliverable Types', state: 'deliverables.types', iconClass: 'fa-navicon'}
        ];

        $scope.navByType = function (type) {
            return _.where($scope.navLocations, {type: type});
        };

        $scope.queueCount = 0;
        $scope.activeNav = false;

        $scope.locateActiveNav = function () {
            var nav = _.find($scope.navLocations, function (nav) {
                return $scope.isActive(nav.link);
            });
            if (_.isUndefined(nav)) return $scope.activeNav = false;
            $scope.activeNav = nav;
            return nav;
        };

        $scope.getClass = function (nav) {
            return $location.$$path.toLowerCase().indexOf(nav.link.substring(1).toLowerCase()) !== -1 ?
                'active' : '';
        };

        $scope.isActive = function (location) {
            return $location.$$path.toLowerCase().indexOf(location.substring(1).toLowerCase()) !== -1;
        };

    });
