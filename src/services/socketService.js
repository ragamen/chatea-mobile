// src/services/socketService.js

import { io } from 'socket.io-client';
import { SOCKET_SERVER_URL } from '@env';

export const initializeSocket = (session) => {
    // 🚨 Comprobamos que la sesión tenga el user.id
    if (!session || !session.user || !session.user.id || !SOCKET_SERVER_URL) {
        console.warn("🟡 Socket Init: Sesión incompleta o URL no definida.");
        return null;
    }

    const socket = io(SOCKET_SERVER_URL, {
        transports: ["websocket"],
        secure: SOCKET_SERVER_URL.startsWith('https://'),
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        
        // 💡 AUTENTICACIÓN: Pasamos el token y el ID para que tu backend pueda validarlos.
        auth: { 
            token: session.access_token, // Tu backend puede usar esto si tienes un middleware
            userId: session.user.id,     // Útil para el seguimiento en el servidor
        },
    });

    // 💡 Registramos explícitamente el usuario al conectar, como tu backend lo espera.
    socket.on('connect', () => {
        console.log(`✅ Socket conectado. Registrando usuario: ${session.user.id}`);
        // El backend espera este evento para añadir el socket al userSocketMap
        socket.emit('registerUser', session.user.id); 
    });
    
    socket.on('disconnect', (reason) => {
        console.log(`🔴 Socket desconectado. Razón: ${reason}`);
    });

    socket.on('connect_error', (err) => {
        console.error(`❌ Socket Error: ${err.message}`);
    });

    return socket;
};