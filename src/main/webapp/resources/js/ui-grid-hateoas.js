(function () {
    'use strict';

    /**
     * @ngdoc overview
     * @name ui.grid.hateoas
     * @description
     *
     * # ui.grid.hateoas
     * [WIP] This module provides read-only hal paging support to ui-grid
     */

     var module = angular.module('ui.grid.hateoas', ['ui.grid', 'ui.grid.paging']);

     module.service('uiGridHateoasService', ['gridUtil', '$resource', 'uiGridConstants',
        function (gridUtil, $resource, uiGridConstants) {

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

                    if (gridOptions.enablePaging) {
                        gridOptions.useExternalPaging = true;
                    }
                    gridOptions.useExternalSorting = true;
                },

                loadData : function (options) {

                    var res = $resource(options.hateoas.url);

                    var resourceOptions = new function () {
                        this[options.hateoas.requestParams.pages]   = '';
                        this[options.hateoas.requestParams.size]    = options.pagingPageSize;
                        this[options.hateoas.requestParams.page]    = options.pagingCurrentPage - 1;
                        if (service.sortColumns.length > 0) {
                            this[options.hateoas.requestParams.sort]    = service.sortColumns[0].field;
                            switch( service.sortColumns[0].sort.direction ) {
                                case uiGridConstants.ASC:
                                this[options.hateoas.requestParams.sort] += options.hateoas.requestParams.asc;
                                break;
                                case uiGridConstants.DESC:
                                this[options.hateoas.requestParams.sort] += options.hateoas.requestParams.desc;
                                break;
                            }
                        }
                    };

                    var responsePromise = res.get(resourceOptions).$promise;

                    return responsePromise.then(function success (response) {
                        var data = [];

                        options.totalItems = response.page.totalElements;
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