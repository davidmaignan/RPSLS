(function($) {
    $('document').ready( function () {

        var socket = io.connect('http://localhost:3000');

        // on connection to server, ask for user's name with an anonymous callback
        socket.on('connect', function(){
            // call the server-side function 'addPlayer' and send one parameter (value of prompt)
            socket.emit('addPlayer', prompt("What's your name?"));
        });

        socket.on('updategame', function (username, data) {
            $('#result').append('<b>'+username + ':</b> ' + data + '<br>');
        });

        $(function(){
            // when the client clicks SEND
            $('#submit').click( function() {
                var value = $( "input:radio[name=choice]:checked" ).val();
                // tell server to execute 'sendchat' and send along one parameter
                socket.emit('playerMove', value);
            });

        });
    });
})(window.jQuery);