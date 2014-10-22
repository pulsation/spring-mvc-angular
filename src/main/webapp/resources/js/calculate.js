console.log("Javascript correctly included");

angular.module('calculate', ['ui.bootstrap', 'ngSanitize', 'rx', 'ngCookies'])

.factory('Auth', ['$cookieStore', '$http', function ($cookieStore, $http) {
//    $http.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
console.log('headers set');
// wemadeyoulook.at/en/blog/implementing-basic-http-authentication-http-requests-angular/
/*    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('authdata');
    console.log($http.defaults.headers.common['Authorization']);*/

    return {
        setCredentials: function (username, password) {
/*        console.log("Encoding");
        var original = username + ':' + password;
            var encoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(username + ':' + password));
            console.log("Encoded:");
            console.log(encoded);
            $http.defaults.headers.common.Authorization = 'Basic ' + encoded;

            $cookieStore.put('authdata', encoded);*/
        }
    }
}])

.controller('CalculateCtrl',  function ($scope, $http, observeOnScope, Auth) {
    console.log("Entered controller");

    $scope.operation = {};

    var httpRequest = function (newVal) {
//        console.log("setting credentials");
//        Auth.setCredentials('user', 'password');
//        console.log("Credentials set");
        return $http({
            method: 'POST',
            url: '/partials/square',
            data: { "x": newVal }
        });
    }

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

