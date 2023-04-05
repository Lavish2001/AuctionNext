const io = require('socket.io')(1111, {
    cors: {
        origin: "http://localhost:9000"
    },
});

const users = {};

io.on('connection', socket => {
    socket.on('auction-started', data => {
        users[socket.id] = data;
        io.emit('join-auction', data)
    })

    // socket.on('user-error', data => {
    //     users[socket.id] = data;
    //     io.to(socket.id).emit('user-message', data)
    // })

    socket.on('bid-message', res => {
        users[socket.id] = res;
        io.emit('send-bid', res)
    })


    socket.on('user-join-auction', res => {
        users[socket.id] = res;
        socket.broadcast.emit('send-detail', res)
    })

    socket.on('user-leave-auction', res => {
        users[socket.id] = res;
        socket.broadcast.emit('leave-detail', res)
    })

});
