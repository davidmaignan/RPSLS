angular.module('sociogram.controllers', ['services', 'Player.services', 'Icon.services'])

    .controller('AppCtrl', function ($scope, $state, socket, OpenFB) {

        $scope.logout = function () {

            OpenFB.get('/me').success(function (user) {
                socket.emit('server:disconnect', user);
                OpenFB.logout();
                $state.go('app.login');
            });
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

    .controller('InvitationCtrl', function ($scope, $state, socket, $window) {

        var playerA = parseInt($window.sessionStorage.userId);
        var playerB = parseInt($state.params.playerId);

        var gameId = (playerA < playerB) ? playerA +'_'+ playerB : playerB + '_' + playerA;

        var game = {
            'playerA'     : playerA,
            'playerB'     : playerB,
            'id'          : gameId,
            'playerAHand' : null,
            'playerBHand' : null,
            'winner'      : null,
            'loser'       : null,
            'completed'   : null
        }

        $scope.invitationSent = 'false';

        $scope.invitationValues = {};

        $scope.isSent = function(bool) {
            return bool === $scope.invitationSent;
        };

        // Called when the form is submitted
        $scope.sendInvitation = function() {

            $scope.invitationValues = resolveForm(this);
            $scope.invitationSent   = 'true';

            game.mission = $scope.invitationValues.mission;
            game.publicly = $scope.invitationValues.publicly;
            game.description = $scope.invitationValues.description;

            socket.emit('server:invitation', game);

            socket.on('client:accepted', function (game) {
                if(game.playerA == parseInt($window.sessionStorage.userId)) {
                    $window.location.href = '#/app/match';
                }
            });

            socket.on('client:rejected', function (game) {
                if(game.playerA == parseInt($window.sessionStorage.userId)) {
                    $window.location.href = '#/app/lobby';
                }
            });
        };

        function resolveForm(form)
        {
            var values = {};

            values.mission = (form.mission === 'humiliate')? 'humiliate': 'fun';
            values.publicly = (form.publicly === false) ? 'false': 'true';
            values.description = form.description;

            return values;
        }
    })

    .controller('LoginCtrl', function ($scope, $location, socket, OpenFB, $http, $window) {

        $scope.facebookLogin = function () {

            OpenFB.login('email,read_stream,publish_stream').then(
                function () {

                    OpenFB.get('/me').success(function (user) {

                        var storage = window.sessionStorage;

                        storage['userId'] = user.id;

                        //Login
                        $http({
                            method: 'POST',
                            url: 'http://192.168.0.17:3000/api/players',
                            params: {
                                "id":        user.id,
                                "firstName": user.first_name,
                                "lastName":  user.last_name,
                                "email":     user.email
                            }
                        }).success(function() {
                            console.log("log in success");
                            socket.emit('server:connect');

                        }).error(function(data, status, headers, config) {
                            OpenFB.logout();
                            $state.go('app.login');
                        });
                    });

                    $location.path('/app/lobby');
                },
                function () {
                    alert('I cannot connect with your facebook account.');
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

    .controller('LobbyCtrl', function ($scope, $stateParams, socket, playerAPIService,
                                       $ionicModal, $ionicPopup, $ionicLoading, $window) {

        $scope.show = function() {
            $scope.loading = $ionicLoading.show({
                content: 'Loading players'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide()
        };

        //$scope.show();

        function loadPlayer(userId) {
            $scope.show();
            playerAPIService.getList(userId).
                success(function (data, status, headers, config) {
                    $scope.hide();
                    $scope.playerList = data;
                    console.log(data);
                    console.log(data);
                }).
                error(function (data, status, headers, config) {
                    $scope.hide();
                    console.log(data);
                });
        }

        loadPlayer();

        socket.on('client:disconnect', function (username, data) {
            loadPlayer();
        });

        socket.on('client:connect', function (username, data) {
            loadPlayer();
        });

        socket.on('client:invitation', function (game) {
            if(game.playerB == parseInt($window.sessionStorage.userId)) {
                $scope.showInvitation(game);
            }
        });

        // A invitation dialog
        $scope.showInvitation = function(game) {
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
                if(res) {
                    socket.emit('server:accepted', game );
                    $window.location.href = '#/app/match';
                } else {
                    //console.log('Do you reject');
                    socket.emit('server:rejected', game );
                    $window.location.href = '#/app/lobby';
                }
            });
        };

    })

    .controller('HandCtrl', function ($scope, $stateParams, iconService, socket, $interval, $window, OpenFB) {

        iconService.drawMyChoice($stateParams.playerChoice);
        iconService.drawFont('opponentChoice', '?');

        $scope.result = "Waiting for your opponent";

        socket.emit('server:playerHand', {
            playerId: parseInt($window.sessionStorage.userId),
            hand: $stateParams.playerChoice
        });

        socket.on('client:result', function (game) {

            var opponentChoice = game.playerAHand;
            var userId         = parseInt($window.sessionStorage.userId)

            if(userId === game.playerA) {
                opponentChoice = game.playerBHand;
            }

            $scope.timer = 3;

            var stop = $interval(function() {

                iconService.drawFont('opponentChoice', $scope.timer);
                console.log("counter");
                $scope.timer --;
                if($scope.timer === -1) {

                    iconService.drawOpponentChoice(opponentChoice);



                    if(game.winner == userId) {
                        $scope.result = "YOU WIN";

                    } else if (game.winner === null){
                        $scope.result = "IT'S A TIE";
                    }else{
                        $scope.result = "YOU LOSE";
                    }

                    if (game.publicly === 'true') {

                        var message = $scope.result + "@ I challenge U against xxx";

//                        OpenFB.post('/me/feed', "testing")
//                            .success(function () {
//                                $scope.status = "This item has been shared on OpenFB";
//                            })
//                            .error(function(data) {
//                                alert(data.error.message);
//                            });
                    }

                    console.log(game);
                }
            }, 1000, 4);

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
        $scope.newTask = function() {
            //socket.emit('message:send', { message: 'test message', name: "david", channel: "channel 1" });
            socket.emit('playerMove', "player move");
            //console.log("new task");
        };

        socket.on('updategame', function (username, data) {
            console.log("updategame");
        });

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