angular.module('sociogram.controllers', ['services', 'Player.services', 'Icon.services'])

    .controller('AppCtrl', function ($scope, $state, OpenFB) {

        $scope.logout = function () {
            OpenFB.logout();
            $state.go('app.login');
        };

        $scope.revokePermissions = function () {
            OpenFB.revokePermissions().then(
                function () {
                    $state.go('app.login');
                },
                function () {
                    alert('Revoke permissions failed');
                });
        };
    })

    .controller('LoginCtrl', function ($scope, $location, OpenFB) {

        $scope.facebookLogin = function () {

            OpenFB.login('email,read_stream,publish_stream').then(
                function () {
                    $location.path('/app/person/me/feed');
                },
                function () {
                    alert('OpenFB login failed');
                });
        };
    })

    .controller('ShareCtrl', function ($scope, OpenFB) {

        $scope.item = {};

        $scope.share = function () {
            OpenFB.post('/me/feed', $scope.item)
                .success(function () {
                    $scope.status = "This item has been shared on OpenFB";
                })
                .error(function(data) {
                    alert(data.error.message);
                });
        };
    })

    .controller('ProfileCtrl', function ($scope, OpenFB) {
        OpenFB.get('/me').success(function (user) {
            $scope.user = user;
        });
    })

    .controller('PersonCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId).success(function (user) {
            $scope.user = user;
        });
    })

    .controller('FriendsCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId + '/friends', {limit: 50})
            .success(function (result) {
                $scope.friends = result.data;
            })
            .error(function(data) {
                alert(data.error.message);
            });
    })

    .controller('MutualFriendsCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId + '/mutualfriends', {limit: 50})
            .success(function (result) {
                $scope.friends = result.data;
            })
            .error(function(data) {
                alert(data.error.message);
            });
    })

    .controller('LeaderboardCtrl', function ($scope, $stateParams) {
        $scope.players = [
            { name: 'John Doe', rank: 1, total: 23, win: 16, lose: 7 },
            { name: 'Patrick Smith', rank: 2, total: 33, win: 16, lose: 7 },
            { name: 'David Maignan', rank: 3, total: 45, win: 16, lose: 7 },
            { name: 'Celine Maignan', rank: 4, total: 56, win: 16, lose: 7 },
            { name: 'John Doe', rank: 1, total: 23, win: 16, lose: 7 },
            { name: 'Patrick Smith', rank: 2, total: 33, win: 16, lose: 7 },
            { name: 'David Maignan', rank: 3, total: 45, win: 16, lose: 7 },
            { name: 'Celine Maignan', rank: 4, total: 56, win: 16, lose: 7 },
        ];
    })

    .controller('LobbyCtrl', function ($scope, $stateParams, playerAPIService, $ionicLoading) {

        $scope.show = function() {
            $scope.loading = $ionicLoading.show({
                content: 'Loading players'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide()
        };

        $scope.show();

        function loadPlayer() {
            $scope.show();
            playerAPIService.getList().
                success(function (data, status, headers, config) {
                    $scope.hide();
                    $scope.playerList = data;
                    console.log(data);
                }).
                error(function (data, status, headers, config) {
                    $scope.hide();
                    console.log(data);
                });
        }

        loadPlayer();
    })

    .controller('GameCtrl', function ($scope, $stateParams, $ionicLoading) {


    })

    .controller('MatchCtrl', function ($scope, $stateParams, iconService, $ionicLoading) {

        iconService.draw("rock");
        iconService.draw("paper");
        iconService.draw("scisor");
        iconService.draw("lizard");
        iconService.draw("spoke");
    })

    .controller('FeedCtrl', function ($scope, $stateParams, socket, OpenFB, $ionicLoading) {

        // Open our new task modal
        $scope.newTask = function() {
            socket.emit('message:send', { message: 'test message', name: "david", channel: "channel 1" });
        };

        $scope.emitMessage = function()
        {
            socket.emit('message:send', { message: 'test message', name: "david", channel: "channel 1" });
        };

        $scope.show = function() {
            $scope.loading = $ionicLoading.show({
                content: 'Loading feed...'
            });
        };
        $scope.hide = function(){
            $scope.loading.hide();
        };

        function loadFeed() {
            $scope.show();
            OpenFB.get('/' + $stateParams.personId + '/home', {limit: 30})
                .success(function (result) {
                    $scope.hide();
                    $scope.items = result.data;
                    // Used with pull-to-refresh
                    $scope.$broadcast('scroll.refreshComplete');
                })
                .error(function(data) {
                    $scope.hide();
                    alert(data.error.message);
                });
        }

        $scope.doRefresh = loadFeed;

        loadFeed();
    });