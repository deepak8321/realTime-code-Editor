import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    return io('http://localhost:5000', options);
};
// process.env.RECT_APP_BACKEND_URL http://localhost:5000