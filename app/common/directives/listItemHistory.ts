/// <reference path="../../../typings/app.d.ts" />

module app {
    'use strict';
    var apConfig, $timeout;

    /* @ngInject */
    function listItemHistory(_apConfig_, _$timeout_) {
        apConfig = _apConfig_;
        $timeout = _$timeout_;

        var directive = {
            scope: {
                listItem: '=',
                template: '='
            },
            controller: ListItemHistoryController,
            controllerAs: 'vm',
            templateUrl: 'common/directives/listItemHistory.tmpl.html'
        };
        return directive;
    }

    interface IControllerScope extends ng.IScope{
        listItem:ap.ListItem;
        template:string;
    }

    class ListItemHistoryController{
        activeVersion = 0;
        availableVersions = 0;
        deliverableRecord:ap.IListItemVersion;
        historyReady = false;
        initialized = false;
        listItem;
        template:string;
        versionHistory:ap.IListItemVersion[];
        constructor($scope:IControllerScope) {
            var vm = this;

            vm.listItem = $scope.listItem;
            vm.template = $scope.template;

            $scope.$watch('listItem', function (newVal, oldVal) {

                if (newVal && newVal.id && !vm.initialized) {
                    vm.initialized = true;
                    /** Load mock version data if offline */
                    if (apConfig.offline) {
                        $.getJSON('xml-cache/deliverable_changes.json', function (cachedChanges) {
                            $timeout(function () {
                                setChanges(cachedChanges);
                            });
                        });
                    } else {
                        /** Pull the version history for all non-readonly fields */
                        vm.listItem.getFieldVersionHistory()
                            .then(function (changes) {
                                console.log(changes);

                                setChanges(changes);
                            });
                    }
                }
            });

            function setChanges(changes) {
                vm.versionHistory = [];
                var ctor = vm.listItem.getModel().factory;
                _.each(changes, function (change) {
                    vm.versionHistory.push(new ctor(change));
                });
                vm.availableVersions = _.size(changes) - 1;
                vm.activeVersion = _.size(changes) - 1;

                /** Initialize with the current version */
                vm.updateVersion(0);
            }

        }
        updateVersion(incrementValue) {
            this.activeVersion = this.activeVersion + incrementValue;
            this.deliverableRecord = this.versionHistory[this.activeVersion];
            this.historyReady = true;
        }
    }


    angular
        .module('pmam-deliverables')
        .directive('listItemHistory', listItemHistory);

}
