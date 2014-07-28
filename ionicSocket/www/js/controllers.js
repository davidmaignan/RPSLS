/**
 * Created by david on 2014-07-26.
 */
angular.module('starter.controllers', ['services', 'openfb'])

    .controller('LoginCtrl', function($scope, $state, OpenFB) {

        console.log(OpenFB);

        //input model
        $scope.user = { name: '', password: '' };

        $scope.login = function login(user) {
            console.log(user.name, user.password);
            $state.go('app');
        }

        $scope.facebookLogin = function () {

            console.log("facebookLogin");

            OpenFB.login('email,read_stream,publish_stream').then(
                function () {
                    $location.path('/app/person/me/feed');
                },
                function () {
                    alert('OpenFB login failed');
                });
        };
    })

    .controller('AppCtrl', function($scope, $state, socket, $ionicSideMenuDelegate) {
        //Ensure they are authed first.
        console.log('app page');

        // Open our new task modal
        $scope.newTask = function() {
            socket.emit('message:send', { message: 'test message', name: "david", channel: "channel 1" });
        };


        $scope.emitMessage = function()
        {
            socket.emit('message:send', { message: 'test message', name: "david", channel: "channel 1" });
        };

        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        //socket.emit('message:send', { message: 'test message', name: "david", channel: "channel 1" });

    })