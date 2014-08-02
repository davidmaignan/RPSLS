var baseUrl = 'http://localhost:3000/';

angular.module('services', [])

    .factory('socket', function socket($rootScope) {
        var socket = io.connect(baseUrl);
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    })

angular.module('Player.services', []).
    factory('playerAPIService', function($http) {

        var playerAPI = {};

        playerAPI.getList = function() {
            return $http({
                method: 'GET',
                url: 'http://192.168.0.17:3000/api/players'
            });
        }

        return playerAPI;
    });