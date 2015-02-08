'use strict';

angular.module('pmam-deliverables')
    .controller('navbarCtrl', function () {
        var vm = this;

        vm.navLocations = [
           {label: 'Schedule', state: 'deliverables.main', iconClass: 'fa-calendar'},
           {label: 'Deliverables', state: 'deliverables.instances', iconClass: 'fa-search'},
           {label: 'Deliverable Types', state: 'deliverables.types', iconClass: 'fa-navicon'}
        ];

    });
