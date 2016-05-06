var app = angular.module('app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('team', {
            url: "/team",
            templateUrl: "views/team.html",
            controller: function($scope) {
                $scope.team = [
                    {
                        "id": 1,
                        "name": "Jimmy",
                        "job": "Systems Administrator II"
                    }, {
                        "id": 2,
                        "name": "Sara",
                        "job": "Programmer Analyst III"
                    }, {
                        "id": 3,
                        "name": "Dennis",
                        "job": "Sales Associate"
                    }, {
                        "id": 4,
                        "name": "Martha",
                        "job": "Food Chemist"
                    }, {
                        "id": 5,
                        "name": "Jason",
                        "job": "Software Consultant"
                    }, {
                        "id": 6,
                        "name": "Gregory",
                        "job": "Physical Therapy Assistant"
                    }, {
                        "id": 7,
                        "name": "Teresa",
                        "job": "Human Resources Manager"
                    }, {
                        "id": 8,
                        "name": "Sharon",
                        "job": "Automation Specialist I"
                    }
                ];
            }
        });
});

app.controller('AppCtrl', ['$scope', function($scope) {

}]);
