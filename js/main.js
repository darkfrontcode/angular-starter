// prevent undefined variable and stuff's
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

app.factory('actions', ['$rootScope', function ($rootScope) {
    var actions = {
        getStore: function(){
            return JSON.parse(localStorage.getItem("enterprise"));
        },
        saveStore(newStore){
            localStorage.setItem("enterprise", JSON.stringify(newStore));
        },
        add: function(person){

            //get store from localStorage
            var storage = this.getStore();

            //clone store team for push purpose
            var newTeam = storage.reduce(function(all, item, index){
                all.push(item);
                return all;
            }, []);

            //push new person to clone array
            newTeam.push(person);

            //set new array to localStorage
            this.saveStore(newTeam);

            //set state and refresh
            this.state = newTeam;
            this.refresh();
        },
        edit: function(person){

            //get store
            var storage = this.getStore();

            //search person in store
            var newTeam = storage.reduce(function(all, item, index){
                if(item.id==person.id) all.push(person);
                else all.push(item);
                return all;
            }, []);

            //set new array to localStorage
            this.saveStore(newTeam);

            //set state and refresh
            this.state = newTeam;
            this.refresh();
        },
        delete: function(id){

            //get store
            var storage = this.getStore();

            //clone team without exlude person
            var newTeam = storage.reduce(function(all, item, index){
                if(item.id!=id) all.push(item)
                return all
            }, []);

            //set new array to localStorage
            this.saveStore(newTeam);

            //set state and refresh
            this.state = newTeam;
            this.refresh();
        },
        refresh: function(){
            $rootScope.$broadcast('refresh');
        },
        state: []
    };

    //delivery actions
    return actions;
}]);

app.controller('teamCtrl', ['$scope','actions', function($scope, actions){

    //delete action
    $scope.delete = function(id){
        
        //call delete action
        actions.delete(id);
    }

}]);

app.controller('editCtrl', ['$scope', '$location', '$stateParams', 'actions', function($scope, $location, $stateParams, actions){

    //get store
    var store = actions.getStore();

    //search for person id in store
    var person = store.reduce(function(all, item, index){
        if(item.id==$stateParams.id) return item
        return all;
    }, {});

    //add new person to scope
    $scope.person = person;

    //save new person
    $scope.save = function(){

        //get add action from actions.actions
        actions.edit($scope.person);

        //redirect page to index
        $location.path('/');
    }

}]);

app.controller('newCtrl', ['$scope', '$location', 'actions', function($scope, $location, actions){

    //get store
    var store = actions.state;

    //search last index of store
    var last_index = store.reduce(function(all, item, index){
        if(index==store.length-1) return item;
        else return all;
    }, []);

    //get id and plus 1 for unique id
    var id = last_index.id+1;
    $scope.person = {id: id, name: "", job: ""}

    //save function
    $scope.save = function(){

        //save new person
        actions.add($scope.person);

        //redirect page to index
        $location.path('/');
    }
}]);

app.controller('AppCtrl', ['$scope','actions', function($scope, actions) {

    //promisses arrays
    var promisses=[],
        paths=[
            'resources/names.json',
            'resources/jobs.json'
        ],
        storage = actions.getStore();

    if(storage){
        //delivery data
        actions.state = storage;
        $scope.team = actions.state;
        console.log('Delivery from "Enterprise" localStorage.');
    }else{
        request_data();
        console.log('Creating a "Enterprise" localStorage.');
    }

    //restore function
    $scope.restore = function(){
        request_data(true);
    }

    //refresh and broadcast data for controller
    $scope.$on('refresh', function(){
        $scope.team = actions.state;
    });

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
    function request_data(update){

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

            //get a + b and crate a new array for delivery to AppCtrl
            var newTeam = data.names.reduce(function(all, item, index){
                all.push({
                    id: index+1,
                    name: data.names[index],
                    job: data.jobs[index]
                });
                return all;
            }, []);

            //create localStorage with delivered data
            localStorage.setItem("enterprise", JSON.stringify(newTeam));

            //delivery data
            actions.state = newTeam;
            $scope.team = actions.state;

            if(update) $scope.$digest();
        });
    }

}]);
