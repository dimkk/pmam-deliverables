'use strict';

describe('Service: userService', function () {
    var userService;

    beforeEach(module('pmam-deliverables'));

    beforeEach(inject(function ($injector) {

        userService = $injector.get('userService');

    }));

    describe('Method: userIsAdmin', function () {
        it('correctly returns value.', function () {

            userService.userRoles['ESED Administrators'] = true;

            expect(userService.userIsAdmin()).toBeTruthy();

            userService.userRoles['ESED Administrators'] = false;

            expect(userService.userIsAdmin()).toBeFalsy();
        });
    });

    describe('Method: userCanContribute', function () {
        it('correctly returns boolean.', function () {

            userService.userRoles['ESED Deliverables Contributors'] = true;

            expect(userService.userCanContribute()).toBeTruthy();

            userService.userRoles['ESED Deliverables Contributors'] = false;

            expect(userService.userCanContribute()).toBeFalsy();
        });
    });



});
