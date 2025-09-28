import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from './useSession'; // Asumimos que obtienes la sesión de aquí
import { initializeSocket } from '../services/socketService';

// 🚨 Nota: Asegúrate de instalar los tipos si usas TypeScript: npm install -D @types/socket.io-client

type SocketType = import('socket.io-client').Socket;

interface SocketContextType {
    socket: SocketType | null;
    isConnected: boolean;
    // Tipo genérico para un mapa de IDs de usuario y su estado de conexión
    onlineStatuses: Record<string, boolean>; 
    emit: (event: string, data?: any, callback?: Function) => void; 
}

export const useSocket = (): SocketContextType => {
    const { session } = useSession();
    const [isConnected, setIsConnected] = useState(false);
    const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>({});
    const socketRef = useRef<SocketType | null>(null);

    // Función segura para emitir eventos
    const emit = useCallback((event: string, data?: any, callback?: Function) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit(event, data, callback);
        } else {
            console.warn(`🟡 Socket no conectado. No se puede emitir evento: ${event}`);
        }
    }, []);

    useEffect(() => {
        if (session && session.user && !socketRef.current) {
            const newSocket = initializeSocket(session);
            
            if (newSocket) {
                socketRef.current = newSocket;

                // 1. Manejo de Conexión
                newSocket.on('connect', () => setIsConnected(true));
                newSocket.on('disconnect', () => setIsConnected(false));
                newSocket.on('connect_error', (err: any) => console.error('Socket Connect Error:', err.message));
                newSocket.on('error', (message: any) => {
                    console.error('Socket Global Error:', message);
                });
                
                // 2. Manejo de Estado de Amigos (Según tu backend)
                
                // Evento 1: Estado inicial al conectarse
                newSocket.on('initialOnlineFriends', (statuses: Record<string, boolean>) => {
                    console.log('Online statuses recibidos:', statuses);
                    // Sobreescribimos el estado inicial
                    setOnlineStatuses(statuses);
                });

                // Evento 2: Actualización de estado de un amigo
                newSocket.on('friendStatusUpdate', (data: { userId: string, isOnline: boolean }) => {
                    console.log(`User ${data.userId} is now ${data.isOnline ? 'ONLINE' : 'OFFLINE'}`);
                    setOnlineStatuses(prev => ({
                        ...prev,
                        [data.userId]: data.isOnline
                    }));
                });

                // 3. Manejo de Mensajes Globales (Errores o notificaciones)
                

                // 💡 Aquí se añadirían eventos de llamadas: 'incomingCall', 'callEnded', etc.

            }
        }
        
        // 4. Limpieza: Cierra el socket al desmontar o al cerrar la sesión
        return () => {
            if (socketRef.current) {
                console.log('🔴 Limpiando y cerrando conexión de socket...');
                // Limpiamos todos los listeners antes de desconectar
                socketRef.current.offAny();
                socketRef.current.disconnect(); 
                socketRef.current = null;
            }
        };
    }, [session]); // El socket se gestiona en base a la sesión de Supabase

    return { socket: socketRef.current, isConnected, onlineStatuses, emit };
};