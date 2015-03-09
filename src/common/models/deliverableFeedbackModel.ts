/// <reference path="../../../typings/tsd.d.ts" />

module app.services {
    'use strict';

    export interface IDeliverableFeedback extends ap.ListItem {

    }

    export class DeliverableFeedbackModel implements IDeliverableFeedback {
        constructor() {

        }
    }

    angular
        .module('pmam-deliverables')
        .service('deliverableFeedbackModel', DeliverableFeedbackModel);
}
