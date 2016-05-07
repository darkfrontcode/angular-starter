"use strict";

//create app
var app = angular.module('app', ['ui.router']);

//router config
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    // $locationProvider.html5mode({ enabled: true, requireBase: false });
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('team', {
            url: "/",
            templateUrl: "views/team.html",
            controller: "teamCtrl"
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
        add: function(person){

            //clone store team for push purpose
            var clone = this.team.reduce(function(all, item, index){
                all.push(item);
                return all;
            }, []);

            //push new person to clone array
            clone.push(person);

            //return new clone array with new person icluded
            return clone;
        },
        edit: function(person){

            //search person
            var newTeam = this.team.reduce(function(all, item, index){
                if(item.id==person.id) all.push(person);
                else all.push(item);
                return all;
            }, []);

            //delivery newTeam
            return newTeam;
        },
        delete: function(id){

            //clone team without exlude person id
            var newTeam = this.team.reduce(function(all, item, index){
                if(item.id!=id) all.push(item)
                return all
            }, []);

            //delivery newTeam
            return newTeam;
        },
        refresh: function(newTeam){
            this.team = newTeam;
            $rootScope.$broadcast('refresh');
        },
        team:null
    };

    return actions;
}]);

app.controller('teamCtrl', ['$scope','store', function($scope, store){

    //delete function
    $scope.delete = function(id){

        //store.action delete
        var newTeam = store.delete(id);

        //refresh and broadcast data for all controllers
        store.refresh(newTeam);
        $scope.$on('refresh', function(){
            $scope.team = store.team;
        });
    }

}]);

app.controller('editCtrl', ['$scope', '$location', '$stateParams', 'store', function($scope, $location, $stateParams, store){

    //search for person id in store.team
    var person = store.team.reduce(function(all, item, index){
        if(item.id==$stateParams.id) return item
        return all;
    }, {});

    //add new person to scope
    $scope.person = person;

    //save new person
    $scope.save = function(){

        //get add action from store.actions
        var newTeam = store.edit($scope.person);

        //refresh and broadcast data for all controllers
        store.refresh(newTeam);
        $scope.$on('refresh', function(){
            $scope.team = store.team;
        });

        //redirect page to index
        $location.path('/');
    }

}]);

app.controller('newCtrl', ['$scope', '$location', 'store', function($scope, $location, store){

    //search last index in store.team
    var last_index = store.team.reduce(function(all, item, index){
        if(index==store.team.length-1) return item;
        else return all;
    }, []);

    //get last index id and plus 1 for unique id
    var id = last_index.id+1;
    $scope.person = {id: id, name: "", job: ""}

    //save function
    $scope.save = function(){

        //get add action from store.actions
        var newTeam = store.add($scope.person);

        //refresh and broadcast data for all controllers
        store.refresh(newTeam);
        $scope.$on('refresh', function(){
            $scope.team = store.team;
        });

        //redirect page to index
        $location.path('/');
    }
}]);

app.controller('AppCtrl', ['$scope','store',function($scope, store) {

    //promisses arrays
    var promisses=[],
        paths=[
            'resources/names.json',
            'resources/jobs.json'
        ];

    //defferd function of jquery
    function request(path){
        var dfrd = $.Deferred();

        $.ajax({
            url: path,
            dataType: 'json',
            cache: true,
            success: function(obj){
                dfrd.resolve(obj);
            },
            error: function(xhr, status, err){
                console.error(path, status, err.toString());
            }
        });

        return dfrd.promise();
    }

    //loop for array path and get his reponses with promisses and Deferred
    function request_data(force){

        //reset array
        if(promisses.length>0) promisses.length=0;

        //put function in array
        promisses[0]=request(paths[0]);
        promisses[1]=request(paths[1]);

        //jquery will wait until all request are finish
        $.when(
            promisses[0],
            promisses[1]
        ).done(function(a, b){

            //organize array
            var data = {names: a.names, jobs: b.jobs};

            //get a + b and crate a news array for delivery to AppCtrl
            var newTeam = data.names.reduce(function(all, item, index){
                all.push({
                    id: index+1,
                    name: data.names[index],
                    job: data.jobs[index]
                });
                return all;
            }, []);

            //refresh and broadcast data for all controllers
            store.refresh(newTeam);
            $scope.$on('refresh', function(){
                $scope.team = store.team;
            });

            //force-update current controller
            if(force) $scope.$digest();
        });
    }

    //execute funcion
    request_data();

    //refresh and broadcast data for all controllers
    $scope.team = store.team;
    $scope.$on('refresh', function(){
        $scope.team = store.team;
    });

    //restore function
    $scope.restore = function(event){
        request_data(true);
    }

}]);
