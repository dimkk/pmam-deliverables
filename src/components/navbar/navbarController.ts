/// <reference path="../../../typings/tsd.d.ts" />


module app.layout {
    'use strict';

    interface INavbarController {
        navLocations: INavLocation[]
    }

    interface INavLocation{
        label:string;
        state:string;
        iconClass:string;
    }

    class navbarController implements INavbarController {
        navLocations = [
            {label: 'Schedule', state: 'deliverables.monthly', iconClass: 'fa-calendar'},
            {label: 'Deliverables', state: 'deliverables.instances', iconClass: 'fa-search'},
            {label: 'Deliverable Types', state: 'deliverables.types', iconClass: 'fa-navicon'}
        ];
    }

    angular
        .module('pmam-deliverables')
        .controller('navbarController', navbarController);

}
