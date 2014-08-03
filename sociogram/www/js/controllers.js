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

    .controller('InvitationCtrl', function ($scope, $state, $window) {

        $scope.invitationSent = 'false';

        $scope.invitationValues = {};

        $scope.isSent = function(bool) {
            return bool === $scope.invitationSent;
        };

        // Called when the form is submitted
        $scope.sendInvitation = function() {

            $scope.invitationValues = resolveForm(this);
            $scope.invitationSent   = 'true';

            $window.location.href = '#/app/match';
        };

        function resolveForm(form)
        {
            var values = {};

            values.mission = (form.mission === 'humiliate')? 'humiliate': 'fun';
            values.publicly = (form.publicly === false) ? 'false': 'true';

            return values;
        }
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

    .controller('HandCtrl', function ($scope, $stateParams, iconService, socket, $interval) {
        iconService.drawMyChoice($stateParams.playerChoice);

        iconService.drawFont('opponentChoice', '?');

        socket.emit('player:move', { playerMove: $stateParams.playerChoice, channel: "channel 1" });

        $scope.timer = 3;

        stop = $interval(function() {

            iconService.drawFont('opponentChoice', $scope.timer);
            console.log("counter");
            $scope.timer --;
            if($scope.timer === -1) {

                iconService.drawOpponentChoice('lizard');
            }
        }, 1000, 4);

        socket.on('opponent:move', function (response) {
            console.log(response);

        });
    })

    .controller('MatchCtrl', function ($scope, $stateParams, iconService, $ionicLoading) {

        iconService.drawIcon("rock");
        iconService.drawIcon("paper");
        iconService.drawIcon("scissor");
        iconService.drawIcon("lizard");
        iconService.drawIcon("spock");
    })

    .controller('FeedCtrl', function ($scope, $stateParams, socket, OpenFB, $ionicLoading, $ionicModal,  $ionicPopup, $window) {

//        // Open our new task modal
//        $scope.newTask = function() {
//            socket.emit('message:send', { message: 'test message', name: "david", channel: "channel 1" });
//        };
//
//        $scope.emitMessage = function()
//        {
//            socket.emit('message:send', { message: 'test message', name: "david", channel: "channel 1" });
//        };
//
//        socket.on('invitation:send', function (username, data) {
//            console.log(data);
//            $scope.invitationModal.show();
//        });
//
//        //socket.emit('message:send', { message: 'test message', name: "david", channel: "channel 1" });
//
//        $scope.show = function() {
//            $scope.loading = $ionicLoading.show({
//                content: 'Loading feed...'
//            });
//        };
//        $scope.hide = function(){
//            $ionicLoading.hide();
//        };
//
//        function loadFeed() {
//            $scope.show();
//            OpenFB.get('/' + $stateParams.personId + '/home', {limit: 30})
//                .success(function (result) {
//                    $scope.hide();
//                    $scope.items = result.data;
//                    // Used with pull-to-refresh
//                    $scope.$broadcast('scroll.refreshComplete');
//                })
//                .error(function(data) {
//                    $scope.hide();
//                    alert(data.error.message);
//                });
//        }
//
//        $scope.doRefresh = loadFeed;
//
//        //loadFeed();
//
//        // Create and load the Modal
//        $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
//            $scope.invitationModal = modal;
//        }, {
//            scope: $scope,
//            animation: 'slide-in-up'
//        });

        socket.on('invitation:send', function (username, data) {
            console.log(data);
            $scope.showInvitation();

        });

        // A invitation dialog
        $scope.showInvitation = function() {
            var confirmPopup = $ionicPopup.confirm({
                buttons: [
                    { text: 'Reject',
                        onTap: function(e) {
                            return false;
                        }
                    },
                    {
                        text: '<b>Accept</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            return true;
                        }
                    }
                ],
                title:    'A challenge was sent to you',
                template: 'The mission is humiliation in public'
            });
            confirmPopup.then(function(res) {

                console.log(res);

                if(res) {
                    $window.location.href = '#/app/match';
                    socket.emit('invitation:accepted', { playerId: "12345", channel: "channel 1" });
                } else {
                    //console.log('Do you reject');
                }
            });
        };
    });