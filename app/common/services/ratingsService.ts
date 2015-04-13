/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var service:RatingsService;

    /**
     * @ngdoc service
     * @name ratingsService
     * @description
     *
     */
    export class RatingsService {
        constructor() {
            service = this;
        }


        getLabelClass(rating:number):string {
            var labelClass;
            if (rating < 2) {
                labelClass = 'label-danger';
            } else if (rating < 3) {
                labelClass = 'label-warning';
            } else if (rating < 4) {
                labelClass = 'label-info';
            } else if (rating < 5) {
                labelClass = 'label-primary';
            } else {
                labelClass = 'label-success';
            }

            return labelClass;
        }

        /**
         * @name ratingsService.starClass
         * @description Returns the appropriate star class based on a rating.
         * @param {number} rating Number value from 0-5.
         */
        starClass(rating:number):string {
            var ratingClass;
            if (rating < 2) {
                ratingClass = 'one-star';
            } else if (rating < 3) {
                ratingClass = 'two-star';
            } else if (rating < 4) {
                ratingClass = 'three-star';
            } else if (rating < 5) {
                ratingClass = 'four-star';
            } else {
                ratingClass = 'five-star';
            }

            return ratingClass;
        }


    }

    angular
        .module('pmam-deliverables')
        .service('ratingsService', RatingsService);

}
