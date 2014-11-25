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

     module.service('uiGridHateoasService', ['gridUtil', '$resource',
        function (gridUtil, $resource) {
            var service = {
                initializeGrid: function(grid, hateoasOptions) {
                    service.defaultGridOptions(grid.options, hateoasOptions);
                },

                defaultGridOptions: function (gridOptions, hateoasOptions) {
                    angular.extend(gridOptions, hateoasOptions);

                },

                loadData : function (params/*url, currentPage, pageSize*/) {
                    var res = $resource(params.url);
                    var responsePromise = res.get({
                        'pages': '',
                        'size': params.pageSize,
                        'page': params.currentPage
                    }).$promise;

                    return responsePromise.then(function success (response) {
                        var data = [];
                        for (var key in response._embedded) {
                            data.push(response._embedded[key]);
                        }
                        return _.flatten(data);
                    }, function failure (response) {
                        throw "Error: Could not load data"
                            + (response.status && response.statusText ? ": " + response.status + " (" + response.statusText + ")"
                            : "");
                    });
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

                        var gridOptions = uiGridCtrl.grid.options;

                        if (gridOptions.enablePaging) {
                            console.log("TODO: Manage paging");
                        }

                        uiGridHateoasService

                        .loadData({
                            url:            gridOptions.uiGridHateoas,
                            currentPage:    gridOptions.pagingCurrentPage - 1,
                            pageSize:       gridOptions.pagingPageSize
                        })

                        .then(function(data) {
                            uiGridCtrl.grid.options.data = _.flatten(data);
                        });
                    }
                };
            }
        };
     }]);
})();