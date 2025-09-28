// app/_layout.tsx (CÓDIGO FINAL CORREGIDO)

import React from 'react';
import { Stack } from 'expo-router'; 
// 🚨 Importa tus contextos
import { SessionProvider } from '../src/context/SessionContext'; 
import { SocketProvider } from '../src/context/SocketContext';     
import { WebRTCProvider } from '../src/context/WebRTCContext';   
import IncomingCallOverlay from '../src/components/IncomingCallOverlay';
export default function RootLayout() {
  return (
    <SessionProvider>
      <SocketProvider>
        {/* 🚀 ESTA ES LA UBICACIÓN CORRECTA */}
        <WebRTCProvider>
          <Stack>
            {/* Rutas que no requieren autenticación (Login, Registro) */}
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            
            {/* Rutas principales (Tabs, Chat, Call) */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
            
            {/* La pantalla de llamada debe ser modal y sin encabezado */}
            <Stack.Screen name="CallScreen" options={{ headerShown: false, presentation: 'modal' }} />
            
            {/* La pantalla de modal genérico (si la usas) */}
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
 
          </Stack>
           <IncomingCallOverlay /> 
        </WebRTCProvider>
      </SocketProvider>
    </SessionProvider>
  );
}