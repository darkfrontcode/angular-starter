var app = angular.module('app', []);

app.controller('AppCtrl', ['$scope', function($scope){
    $scope.person = {name: "Picard"};
}])
