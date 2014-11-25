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
                    if (gridOptions.enablePaging) {
                        gridOptions.useExternalPaging = true;
                        console.log("TODO: Manage paging");
                    }
                },

                loadData : function (params, options) {
                    var res = $resource(params.url);
                    var responsePromise = res.get({
                        'pages': '',
                        'size': params.pageSize,
                        'page': params.currentPage
                    }).$promise;

                    return responsePromise.then(function success (response) {
                        var data = [];

                        console.log("FIXME: options.totalItems is not taken in account. https://github.com/angular-ui/ng-grid/blob/master/src/features/paging/js/ui-grid-paging.js");
                        options.totalItems = response.page.totalElements;

                        console.log(options.totalItems);
                        for (var key in response._embedded) {
                            data.push(response._embedded[key]);
                        }
                        return _.flatten(data);
                    }, function failure (response) {
                        throw "Error: Could not load data"
                            + (response.status && response.statusText ? ": " + response.status + " (" + response.statusText + ")"
                            : "");
                    })
                    .then(function(data) {
                        options.data = _.flatten(data);
                    });

                }
            };

            return service;
        }
     ]);

     module.directive('uiGridHateoas', ['uiGridHateoasService', function (uiGridHateoasService) {
        return {
            scope: false,
            priority: -200,
            require: 'uiGrid',

            compile: function($scope, $elm, $attr){
                return {
                    pre: function($scope, $elm, $attr, uiGridCtrl) {
                        uiGridHateoasService.initializeGrid(uiGridCtrl.grid, {
                            'uiGridHateoas': $attr.uiGridHateoas
                        });
                    },
                    post: function($scope, $elm, $attr, uiGridCtrl) {

                        var gridOptions = uiGridCtrl.grid.options;

                        if (gridOptions.enablePaging) {
                            uiGridCtrl.grid.api.paging.on.pagingChanged($scope, function (currentPage, pageSize) {
                                console.log("TODO: Update data");
                                console.log(currentPage);
                                console.log(pageSize);
                            });
                        }

                        uiGridHateoasService

                        .loadData({
                            url:            gridOptions.uiGridHateoas,
                            currentPage:    gridOptions.pagingCurrentPage - 1,
                            pageSize:       gridOptions.pagingPageSize
                        }, gridOptions)
                        .then(function () {
                            uiGridCtrl.grid.refresh();
                        });

                    }
                };
            }
        };
     }]);
})();