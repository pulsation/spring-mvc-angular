console.log("Javascript correctly included");

angular.module('calculate', ['ui.bootstrap', 'ngSanitize', 'rx', 'ngCookies'])

.controller('CalculateCtrl',  function ($scope, $http, observeOnScope) {
    console.log("Entered controller");

    $scope.operation = {};

    var httpRequest = function (newVal) {
        return $http({
            method: 'POST',
            url: '/partials/square',
            data: { "x": newVal }
        });
    };

    // Create an observable
    var obs1 =
    // Watch scope variable named "operation.operand"
    $scope.$toObservable('operation.operand')
    // Throttle stream in order to avoid too much ajax requests
    .throttle(300)
    // Take async requests in the right order
    .flatMapLatest(function(operand) {
        return (httpRequest(operand.newValue));
    })
    // Don't terminate stream on failure
//    .retry()
    ;

    // Subscribe to observer stream
    obs1.subscribe(function success(response) {
        // Replace HTML code with data content
        $scope.operation.result = response.data;
    }, function failure(data) {
        // Handle error
        console.log("Error:");
        console.log(data);
    });

});

