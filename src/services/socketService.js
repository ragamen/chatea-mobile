// src/services/socketService.js

import { io } from 'socket.io-client';
import { SOCKET_SERVER_URL } from '@env';

export const initializeSocket = (session) => {
    if (!session || !SOCKET_SERVER_URL) {
        return null;
    }

    const socket = io(SOCKET_SERVER_URL, {
        transports: ["websocket"],
        secure: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        // Puedes pasar el token de auth en las opciones si tu backend lo requiere
        // auth: { token: session.access_token }, 
    });
    
    return socket;
};