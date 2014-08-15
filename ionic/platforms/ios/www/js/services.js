var baseUrl = 'http://192.168.0.17:3000/';

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
    factory('playerAPIService', function($http, $window) {

        var playerAPI = {};

        playerAPI.getList = function() {
            return $http({
                method: 'GET',
                url: 'http://192.168.0.17:3000/api/players/'
            });
        }

        return playerAPI;
    });

angular.module('Icon.services', []).
    factory('iconService', function($http) {

        function icon() {
            var i, j, canvas, ratio, size;

            var borderScisor = [
                [114,45], [93,44], [75, 33], [60, 46], [23, 34], [20, 40], [53, 60], [16, 65],
                [17, 73], [40, 73], [46, 82], [50, 83], [52, 90], [66, 91], [73, 86], [86, 86], [97, 76], [114, 76]
            ];

            var detailsScisor = [
                [[60, 46], [62, 62], [70, 60], [70, 50], [77, 47], [76, 60], [84, 65]],
                [[40, 73], [70, 70], [78, 80], [73, 86]],
                [[50, 83], [74, 75]],
            ];

            var borderRock = [
                [91,15], [73,31], [32, 41], [30, 69], [35, 73], [35, 77], [42, 82], [43, 85],
                [52, 89], [58, 92], [64, 91], [65, 94], [86, 87], [93, 73], [93, 60], [113, 42]
            ];

            var detailsRock = [
                [[38, 50], [35, 73]],
                [[45, 58], [42, 82]],
                [[53, 64], [52, 89]],
                [[64, 91], [76, 82], [78, 73], [73, 67], [68, 72], [69, 78]],
                [[64, 80], [70, 77]],
            ];

            var borderPaper = [
                [9,44], [27,57], [34, 72], [56, 91], [61, 84], [47, 68], [85, 85], [91, 80],
                [98, 79], [102, 73], [99, 71], [101, 64], [98, 61], [99, 55], [71, 36], [40, 26], [28, 17]
            ];

            var detailsPaper = [
                [[66, 65], [91, 80]],
                [[70, 56], [102, 73]],
                [[73, 48], [98, 61]],
            ];

            var borderScisor = [
                [114,45], [93,44], [75, 33], [60, 46], [23, 34], [20, 40], [53, 60], [16, 65],
                [17, 73], [40, 73], [46, 82], [50, 83], [52, 90], [66, 91], [73, 86], [86, 86], [97, 76], [114, 76]
            ];

            var detailsScisor = [
                [[60, 46], [62, 62], [70, 60], [70, 50], [77, 47], [76, 60], [84, 65]],
                [[40, 73], [70, 70], [78, 80], [73, 86]],
                [[50, 83], [74, 75]],
            ];

            var borderLizard = [
                [35, 109], [28, 73], [35, 40], [64, 27], [96, 40], [96, 44], [94, 46], [90, 50],
                [82, 50], [66, 46], [53, 51], [60, 59], [81, 53], [88, 51], [87, 60], [71, 73], [58, 84], [59, 115]
            ];

            var detailsLizard = [
                [[45, 40], [66, 33], [94, 46]]
            ];

            var borderSpoke = [
                [49, 115], [49, 98], [39, 86], [33, 79], [19, 70], [24, 65], [48, 74], [49, 31],
                [56, 29], [57, 22], [65, 22], [70, 58], [82, 30], [88, 33],[87, 41], [93, 44], [89, 64], [85, 86], [78, 99], [77, 118]
            ];

            var detailsSpoke = [
                [[56, 29], [59, 59]],
                [[87, 41], [78, 63]],
                [[56, 77], [64, 85], [64, 96]],
            ];

            function drawCircle(){
                if (canvas.getContext) {
                    ctx = canvas.getContext("2d");
                    ctx.beginPath();
                    ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2, true);
                    ctx.lineWidth = 6;
                    ctx.fillStyle = '#d6dbe1';
                    ctx.strokeStyle = '#344458';
                    ctx.fill();
                    ctx.stroke();
                }
            }

            function drawBorder(border) {
                if (canvas.getContext) {
                    ctx = canvas.getContext("2d");
                    ctx.beginPath();
                    ctx.moveTo(border[0][0] * (size/124), border[0][1] * (size/124));
                    for (i = 1; i < border.length; i++) {
                        ctx.lineTo(border[i][0]* (size/124), border[i][1]* (size/124));
                    }
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.fillStyle = 'white';
                    ctx.fill();
                    ctx.closePath();
                }
            }

            function drawLines(details) {

                if (canvas.getContext) {
                    for (i = 0; i < details.length; i++) {
                        ctx.beginPath();
                        ctx.moveTo(details[i][0][0]* (size/124), details[i][0][1]* (size/124));
                        for (j = 1; j < details[i].length; j++) {
                            ctx.lineTo(details[i][j][0]* (size/124), details[i][j][1]* (size/124));
                        }
                        ctx.lineWidth = .75;
                        ctx.fillStyle = '#344458';
                        ctx.stroke();
                    }
                }
            }

            function drawFont(id, font){

                canvas = document.getElementById(id);

                if (canvas.getContext) {
                    ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    drawCircle();
                    ctx.font = 'bold 80pt Arial';
                    ctx.fillStyle = 'white';
                    ctx.fillText(font, 25, 90);
                }
            }

            function drawMyChoice(id) {
                canvas = document.getElementById("myChoice");

                if (canvas.getContext) {
                    ctx = canvas.getContext("2d");
                }

                drawCircle();

                switch(id){
                    case 'rock':
                        drawBorder(borderRock);
                        drawLines(detailsRock);
                        break;
                    case 'paper':
                        drawBorder(borderPaper);
                        drawLines(detailsPaper);
                        break;
                    case 'scissor':
                        drawBorder(borderScisor);
                        drawLines(detailsScisor);
                        break;
                    case 'lizard':
                        drawBorder(borderLizard);
                        drawLines(detailsLizard);
                        break;
                    case 'spock':
                        drawBorder(borderSpoke);
                        drawLines(detailsSpoke);
                        break;
                }
            }

            function drawOpponentChoice(id) {
                canvas = document.getElementById("opponentChoice");

                if (canvas.getContext) {
                    ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }

                drawCircle();
                switch(id){
                    case 'rock':
                        drawBorder(borderRock);
                        drawLines(detailsRock);
                        break;
                    case 'paper':
                        drawBorder(borderPaper);
                        drawLines(detailsPaper);
                        break;
                    case 'scissor':
                        drawBorder(borderScisor);
                        drawLines(detailsScisor);
                        break;
                    case 'lizard':
                        drawBorder(borderLizard);
                        drawLines(detailsLizard);
                        break;
                    case 'spock':
                        drawBorder(borderSpoke);
                        drawLines(detailsSpoke);
                        break;
                }
            }


            function drawIcon(id) {
                canvas = document.getElementById(id);

                if (canvas.getContext) {
                    ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    size = canvas.width;
                }

                drawCircle();
                switch(id){
                    case 'rock':
                        drawBorder(borderRock);
                        drawLines(detailsRock);
                        break;
                    case 'paper':
                        drawBorder(borderPaper);
                        drawLines(detailsPaper);
                        break;
                    case 'scissor':
                        drawBorder(borderScisor);
                        drawLines(detailsScisor);
                        break;
                    case 'lizard':
                        drawBorder(borderLizard);
                        drawLines(detailsLizard);
                        break;
                    case 'spock':
                        drawBorder(borderSpoke);
                        drawLines(detailsSpoke);
                        break;
                }
            }
            return {
                drawIcon: drawIcon,
                drawFont: drawFont,
                drawMyChoice: drawMyChoice,
                drawOpponentChoice: drawOpponentChoice
            };
        }

        return new icon();
    });