/// <reference path="../../typings/app.d.ts" />
module app {
    'use strict';

    export interface IUser extends ap.IUser{}

    angular
        .module('pmam-deliverables')
        .constant('user', {lookupId: '', lookupValue:''});
}
