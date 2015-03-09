/// <reference path="../../../typings/tsd.d.ts" />


module app.layout {
    'use strict';

    interface INavbarController {
        navLocations: Object[]
    }

    class navbarController implements INavbarController {
        navLocations: Object[];

        constructor() {
            var vm = this;
            vm.navLocations = [
                {label: 'Schedule', state: 'deliverables.monthly', iconClass: 'fa-calendar'},
                {label: 'Deliverables', state: 'deliverables.instances', iconClass: 'fa-search'},
                {label: 'Deliverable Types', state: 'deliverables.types', iconClass: 'fa-navicon'}
            ];

        }
    }

    angular
        .module('pmam-deliverables')
        .controller('navbarController', navbarController);

}
