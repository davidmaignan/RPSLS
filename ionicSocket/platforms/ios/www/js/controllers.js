/**
 * Created by david on 2014-07-26.
 */
angular.module('starter.controllers', ['services'])

    .controller('LoginCtrl', function($scope, $state) {

        //input model
        $scope.user = { name: '', password: '' };

        $scope.login = function login(user) {
            console.log(user.name, user.password);
            $state.go('app');
        }
    })

    .controller('AppCtrl', function($scope, $state, socket) {
        //Ensure they are authed first.
        console.log('app page')

    })