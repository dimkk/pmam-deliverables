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
        versionHistory: ap.IListItemVersion[];
        monthOptions: { number: number; label: string }[];
        deliverableTypes: DeliverableDefinition[];
        constructor($scope: IControllerScope, private calendarService: CalendarService, private $q, private deliverableDefinitionsModel: DeliverableDefinitionsModel) {
            var vm = this;

            vm.listItem = $scope.listItem;
            vm.template = $scope.template;
            vm.monthOptions = calendarService.getMonthOptions();
            

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
            
            var vm = this;
            vm.activeVersion = this.activeVersion + incrementValue;
            vm.deliverableRecord = this.versionHistory[this.activeVersion];
            vm.historyReady = true;

            //this gets called based on the version
            this.deliverableDefinitionsModel.getFyDefinitions(this.deliverableRecord.fy).then(function (data) {
                vm.deliverableTypes = data; 
            });
        }
    }


    angular
        .module('pmam-deliverables')
        .directive('listItemHistory', listItemHistory);

}
