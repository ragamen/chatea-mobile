// src/context/SessionContext.js

import React, { createContext, useContext, useMemo } from 'react';
// 🚨 Nota: Debes cambiar la extensión si tu hook usa .ts
import { useSession } from '../hooks/useSession.ts'; 

const SessionContext = createContext(null);

export const useSessionContext = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSessionContext must be used within a SessionProvider');
    }
    return context;
};

// Asume que useSession devuelve { session, isLoading, logout, login }
export function SessionProvider({ children }) {
    const sessionData = useSession();
    const value = useMemo(() => sessionData, [sessionData]);

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}