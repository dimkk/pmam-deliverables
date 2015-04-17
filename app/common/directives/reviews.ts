/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var template = `
    <div style="font-size: large">
        <acceptable-feedback-label data-feedback="vm.feedback"></acceptable-feedback-label>
    </div>
    <br/>
    <p>{{ vm.feedback.comments}}</p>
    <div class="small">By: {{ vm.feedback.author.lookupValue }}</div>
    <div class="small">Updated: {{vm.feedback.modified | date:'shortDate' }}</div>
    <div class="text-align-right">
        <a href ng-click="feedback.openModal()"><i class="fa fa-pencil-square-o"></i> view</a>
    </div>`;


    function reviews() {
        var directive = {
            controller: reviewsController,
            controllerAs: 'vm',
            scope: {feedback: '='},
            template: template
        };
        return directive;
    }

    function reviewsController($scope:{feedback:DeliverableFeedback}) {
        var vm = this;
        vm.feedback = $scope.feedback;
    }

    // I render the review details by user of a deliverable
    angular
        .module('pmam-deliverables')
        .directive('reviews', reviews);

}
