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
                initializeGrid: function(grid, hateoasOptions) {
                    service.defaultGridOptions(grid.options, hateoasOptions);
                },

                defaultGridOptions: function (gridOptions, hateoasOptions) {
                    angular.extend(gridOptions, hateoasOptions);

                }
            };

            return service;
        }
     ]);

     module.directive('uiGridHateoas', ['uiGridHateoasService', function (uiGridHateoasService) {
        return {
            scope: false,
            require: 'uiGrid',
            compile: function($scope, $elm, $attr){
                return {
                    pre: function($scope, $elm, $attr, uiGridCtrl) {
                        uiGridHateoasService.initializeGrid(uiGridCtrl.grid, { 'uiGridHateoas': $attr.uiGridHateoas });
                    },
                    post: function($scope, $elm, $attr, uiGridCtrl) {
                        if (uiGridCtrl.grid.options.enablePaging) {
                            console.log("TODO: Manage paging");
                        }

                        console.log("TODO: Manage HATEOAS link " +  uiGridCtrl.grid.options.uiGridHateoas);
                    }
                };
            }
        };
     }]);
})();