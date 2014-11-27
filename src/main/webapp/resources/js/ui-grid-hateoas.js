(function () {
    'use strict';

    /**
     * @ngdoc overview
     * @name ui.grid.hateoas
     * @description
     *
     * # ui.grid.hateoas
     * This module provides read-only server-side hal paging support to ui-grid
     */

     var module = angular.module('ui.grid.hateoas', ['ui.grid', 'ui.grid.paging']);

     module.service('uiGridHateoasService', ['gridUtil', '$http', 'uiGridConstants',
        function (gridUtil, $http, uiGridConstants) {

            var service = {

                sortColumns: [],

                initializeGrid: function(grid, urlAsAttr) {
                    service.defaultGridOptions(grid.options, urlAsAttr);

                    var publicApi = {
                        methods: {
                            hateoas: {
                                reloadData: function() {
                                    service.loadData(this.options);
                                }
                            }
                        }
                    };

                    grid.api.registerMethodsFromObject(publicApi.methods);

                },

                defaultGridOptions: function (gridOptions, urlAsAttr) {

                    gridOptions.hateoas                     = gridOptions.hateoas || {};
                    gridOptions.hateoas.url                 = gridOptions.hateoas.url || urlAsAttr;
                    gridOptions.hateoas.pageSection         = gridOptions.hateoas.pageSection || 'page';
                    gridOptions.hateoas.requestParams       = gridOptions.hateoas.requestParams || {};
                    gridOptions.hateoas.requestParams.page  = gridOptions.hateoas.requestParams.page || 'page';
                    gridOptions.hateoas.requestParams.size  = gridOptions.hateoas.requestParams.size || 'size';
                    gridOptions.hateoas.requestParams.pages = gridOptions.hateoas.requestParams.pages || 'pages';
                    gridOptions.hateoas.requestParams.sort  = gridOptions.hateoas.requestParams.sort || 'sort';
                    gridOptions.hateoas.requestParams.asc   = gridOptions.hateoas.requestParams.asc || ',asc';
                    gridOptions.hateoas.requestParams.desc  = gridOptions.hateoas.requestParams.desc || ',desc';

                    /**
                     * A function that adds sorting parameters to the url.
                     */
                    gridOptions.hateoas.addSortParams = gridOptions.hateoas.addSortParams || function (url, sortColumns, options) {

                        if (sortColumns.length > 0) {
                            angular.forEach(sortColumns, function (sortColumn) {
                                url += "&" + encodeURIComponent(options.hateoas.requestParams.sort)
                                url += '=' + encodeURIComponent(sortColumn.field);
                                if (sortColumn.sort.direction === uiGridConstants.ASC) {
                                    url += encodeURIComponent(options.hateoas.requestParams.asc);
                                } else if (sortColumn.sort.direction === uiGridConstants.DESC) {
                                    url += encodeURIComponent(options.hateoas.requestParams.desc);
                                }
                            });
                        }
                        return url;
                    };

                    if (gridOptions.enablePaging) {
                        gridOptions.useExternalPaging = true;
                    }
                    gridOptions.useExternalSorting = true;
                },

                loadData : function (options) {

                    var baseUrl = options.hateoas.url;

                    // URL parameters have to be constructed "by hand" to preserve their order.
                    baseUrl += (baseUrl.indexOf('?') === -1) ? '?' : '&';
                    baseUrl += encodeURIComponent(options.hateoas.requestParams.pages);
                    baseUrl += "&" + encodeURIComponent(options.hateoas.requestParams.size);
                    baseUrl += '=' + encodeURIComponent(options.pagingPageSize);
                    baseUrl += "&" + encodeURIComponent(options.hateoas.requestParams.page);
                    baseUrl += '=' + encodeURIComponent(options.pagingCurrentPage - 1);

                    var url = options.hateoas.addSortParams(baseUrl, service.sortColumns, options);

                    var responsePromise = $http.get(url);

                    return responsePromise.then(function success (response) {
                        var data = [];
                        options.totalItems = response.data.page.totalElements;
                        for (var key in response.data._embedded) {
                            data.push(response.data._embedded[key]);
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

                },

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
                        uiGridHateoasService.initializeGrid(uiGridCtrl.grid, $attr.uiGridHateoas);
                    },
                    post: function($scope, $elm, $attr, uiGridCtrl) {

                        var gridOptions = uiGridCtrl.grid.options;

                        if (gridOptions.enablePaging) {
                            uiGridCtrl.grid.api.paging.on.pagingChanged($scope, function (currentPage, pageSize) {

                                uiGridHateoasService
                                .loadData(gridOptions)
                                .then(function () {
                                    uiGridCtrl.grid.refresh();
                                });

                            });
                        }

                        uiGridCtrl.grid.api.core.on.sortChanged($scope, function (grid, sortColumns) {

                            uiGridHateoasService.sortColumns = sortColumns;

                            uiGridHateoasService
                            .loadData(gridOptions)
                            .then(function () {
                                uiGridCtrl.grid.refresh();
                            });

                        });

                        uiGridHateoasService
                        .loadData(gridOptions)
                        .then(function () {
                            uiGridCtrl.grid.refresh();
                        });

                    }
                };
            }
        };
     }]);
})();