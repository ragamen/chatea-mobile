// src/context/SocketContext.js

import React, { createContext, useContext, useMemo } from 'react';
// 🚨 Nota: Debes cambiar la extensión si tu hook usa .ts
import { useSocket } from '../hooks/useSocket.ts'; 

const SocketContext = createContext(null);

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
};

// Asume que useSocket devuelve { socket, isConnected, onlineStatuses, emit }
export function SocketProvider({ children }) {
    // 💡 useSocket necesita la sesión, por lo que este Provider debe ir DENTRO de SessionProvider
    const socketData = useSocket();
    const value = useMemo(() => socketData, [socketData]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}