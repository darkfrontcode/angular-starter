"use strict";

var app = angular.module('app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    // $locationProvider.html5mode({ enabled: true, requireBase: false });
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('team', {
            url: "/",
            templateUrl: "views/team.html",
            controller: "deleteCtrl"
        })
        .state('new', {
            url: "/new",
            templateUrl: "views/new.html",
            controller: "newCtrl"
        })
        .state('edit', {
            url: "/edit/{id:int}",
            templateUrl: "views/edit.html",
            controller: "editCtrl"
        });
});

app.factory('store', ['$rootScope', function ($rootScope) {
    var actions = {
        preRender: function(newTeam){
            this.team = newTeam;
            this.renderItem();
        },
        renderItem: function(){
            $rootScope.$broadcast('handleBroadcast');
        },
        team:[
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
        ]
    };

    return actions;
}]);

app.controller('deleteCtrl', ['$scope','store', function($scope, store){
    $scope.delete = function(id){

        var new_team = $scope.team.reduce(function(all, item, index){
            if(item.id!=id) all.push(item)
            return all
        }, []);

        store.preRender(new_team);
        $scope.$on('handleBroadcast', function(){
            $scope.team = store.team;
        });
    }
}]);

app.controller('editCtrl', ['$scope', '$location', '$stateParams', 'store', function($scope, $location, $stateParams){

    var person = $scope.team.reduce(function(all, item, index){
        if(item.id==$stateParams.id) return item
        return all;
    }, {});
    $scope.person = person;

    $scope.save = function(){
        $location.path('/');
    }
}]);

app.controller('newCtrl', ['$scope', '$location', 'store', function($scope, $location){
    $scope.person = {name: "", job: ""}
    $scope.save = function(){
        $scope.team.push($scope.person)
        $location.path('/');
    }
}]);

app.controller('AppCtrl', ['$scope','store',function($scope, store) {
    $scope.team = store.team;

    $scope.$on('handleBroadcast', function(){
        $scope.team = store.team;
    });
}]);
