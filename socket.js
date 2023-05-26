// singleton to share socket.io object over files
let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        return io;
    },
    getIO : () => {
        if (!io) {
            throw new Error('socket.io is not initialized yet!');
        }
        return io;
    }
}