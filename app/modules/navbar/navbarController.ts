/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    interface navLocation{
        label: string;
        state: string;
        iconClass: string;
    }

class NavbarController{
    navLocations:navLocation[] = [
        {label: 'By Month', state: 'deliverables.monthly', iconClass: 'fa-calendar'},
        {label: 'By Type', state: 'deliverables.instances', iconClass: 'fa-code-fork'},
        {label: 'All Types', state: 'deliverables.types', iconClass: 'fa-list'}
    ];
    constructor() {
        var vm = this;
    }
}

    angular.module('pmam-deliverables')
        .controller('navbarController', NavbarController);

}
