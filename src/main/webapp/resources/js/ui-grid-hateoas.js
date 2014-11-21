(function () {
    'use strict';

    /**
     * @ngdoc overview
     * @name ui.grid.hateoas
     * @description
     *
     * # ui.grid.hateoas
     * [WIP] This module provides read-only hateoas support to ui-grid
     */

     var module = angular.module('ui.grid.hateoas', ['ui.grid', 'ui.grid.paging']);

     module.service('uiGridHateoasService', ['gridUtil',
        function (gridUtil) {
            var service = {
                initializeGrid: function(grid) {
                    service.defaultGridOptions(grid.options);
                },

                defaultGridOptions: function (gridOptions) {
                    gridOptions.pagingPageSizes = [10, 20, 30];
                    gridOptions.pagingPageSize  = 10;
                }
            };

            return service;
        }
     ]);

     module.directive('uiGridHateoas', ['uiGridHateoasService', function (uiGridHateoasService) {
        return {
            scope: false,
            require: ['uiGrid'],
            compile: function($scope, $elm, $attr){
                return {
                    pre: function($scope, $elm, $attr, ctrls) {
                        uiGridHateoasService.initializeGrid(ctrls[0].grid);
                    },
                    post: function($scope, $elm, $attr) {
                    }
                };
            }
        };
     }]);
})();