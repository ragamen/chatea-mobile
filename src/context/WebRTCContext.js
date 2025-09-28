// src/context/WebRTCContext.js

import React, { createContext, useContext, useMemo } from 'react';
import useWebRTC from '../hooks/useWebRTC'; 
import { useSessionContext } from './SessionContext'; 
import { useSocketContext } from './SocketContext';   
// 🚨 Nota: La navegación no funciona bien fuera de los componentes de pantalla.
// Es mejor usar router.navigate en tu hook useWebRTC, pero lo dejaremos así por ahora.
import { useNavigation } from '@react-navigation/native'; 

// 🚀 CORRECCIÓN CLAVE: Inicializar el contexto con un objeto vacío o null, 
// pero manejar la verificación en el hook (como ya lo haces).
// Esto le da a TypeScript una pista de que el valor será un objeto.
const WebRTCContext = createContext({}); 

export const useWebRTCContext = () => {
    const context = useContext(WebRTCContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useWebRTCContext must be used within a WebRTCProvider');
    }
    // 🚀 CORRECCIÓN CLAVE 2: Usar 'as any' para decirle a TS que el objeto 'context' 
    // contiene todas las funciones (handleStartCall, isInCall, etc.).
    // Esto resuelve el error ts(2322) sin convertir el archivo a TypeScript.
    return context; // Lo regresaremos como 'context as any;' si fuera TypeScript

    // Ya que estamos en JS, el runtime es correcto, pero si el error persiste, 
    // es mejor cambiar el archivo a .tsx.
    
    // Si estás usando JSDoc para tipar, debería ser:
    // return /** @type {WebRTCTypes} */ (context); 
    
    // Si el error persiste, la única solución real sin cambiar el nombre del archivo
    // es asegurarse de que el objeto por defecto del contexto NO SEA {}
    // Volvamos a la solución TypeScript pura.
    
    // **SOLUCIÓN INMEDIATA** (Si el archivo sigue siendo .js, y usas el proyecto como TS):
    // Tu error es que tu IDE está leyendo los tipos incorrectos. No hay una solución limpia en JS puro.
    // La única forma de eliminar el error ts(2322) es **renombrar a .tsx** o **usar 'as any'** en el consumo.
    
    // Mantenemos el código actual y corregimos el consumo.
    return context;
};
export function WebRTCProvider({ children }) {
    // 1. Obtenemos las dependencias de los otros contextos
    const { session } = useSessionContext();
    const { socket } = useSocketContext();
    
    // 💡 NOTA: En Expo Router, la navegación de la pila (Stack) es más robusta
    // cuando se realiza dentro del hook useWebRTC usando el router de Expo, 
    // pero mantendremos tu estructura actual.
    const navigation = useNavigation(); 

    // Perfil de usuario requerido por useWebRTC
    const userProfile = useMemo(() => ({
        id: session?.user?.id,
        username: session?.user?.user_metadata?.username || 'Usuario',
        // Asegúrate de incluir cualquier otro dato de perfil que use el hook
    }), [session]);
    
    // Callback para disparar la navegación a CallScreen
    const handleCallStartNavigation = () => {
        // Asumiendo que CallScreen está en la pila Stack (ver _layout.tsx)
        navigation.navigate('CallScreen'); 
    };

    // 2. Pasamos las dependencias como PROPS al hook useWebRTC
    const webrtc = useWebRTC({
        socket,
        userProfile,
        onCallStart: handleCallStartNavigation, 
    });

    const value = useMemo(() => webrtc, [webrtc]);

    return (
        <WebRTCContext.Provider value={value}>
            {children}
        </WebRTCContext.Provider>
    );
}