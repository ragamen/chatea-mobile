// src/components/IncomingCallOverlay.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// 💡 Usamos useWebRTCContext para obtener el estado de la llamada entrante y las acciones
import { useWebRTCContext } from '../context/WebRTCContext'; 
import { Phone, PhoneIncoming, PhoneOff } from 'lucide-react-native'; 

export default function IncomingCallOverlay() {
    // 1. Obtener estado y acciones del contexto
    const { 
        isReceivingCall,   // Booleano: true si hay una llamada entrante activa
        partnerUsername,   // Nombre de quien llama
        callType,          // 'audio' o 'video'
        handleAcceptCall,  // Función para aceptar la llamada
        handleRejectCall,  // Función para rechazar la llamada
    } = useWebRTCContext(); // 💡 Nota: Asumimos que resolviste el problema de tipado con 'as any' aquí.

    // No renderizamos nada si no hay una llamada entrante
    if (!isReceivingCall) {
        return null;
    }

    const callIcon = callType === 'video' ? 'Videollamada' : 'Llamada de audio';

    return (
        // El estilo 'overlayContainer' asegura que el componente flote sobre toda la app
        <View style={styles.overlayContainer}>
            <View style={styles.card}>
                
                <Text style={styles.incomingText}>Llamada Entrante</Text>
                <Text style={styles.callerText}>{partnerUsername}</Text>
                <Text style={styles.typeText}>{callIcon}</Text>

                <View style={styles.buttonsContainer}>
                    {/* Botón 1: Rechazar llamada (Rojo) */}
                    <TouchableOpacity 
                        style={[styles.button, styles.rejectButton]}
                        onPress={handleRejectCall}
                    >
                        <PhoneOff color="white" size={30} />
                    </TouchableOpacity>

                    {/* Botón 2: Aceptar llamada (Verde) */}
                    <TouchableOpacity 
                        style={[styles.button, styles.acceptButton]}
                        onPress={handleAcceptCall}
                    >
                        <PhoneIncoming color="white" size={30} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        // Estilos para que cubra toda la pantalla de forma absoluta
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo semitransparente oscuro
        zIndex: 9999, // Asegurar que siempre esté encima
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 30,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    incomingText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4F46E5', // Color primario
        marginBottom: 10,
    },
    callerText: {
        fontSize: 28,
        fontWeight: 'extrabold',
        marginBottom: 5,
    },
    typeText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 25,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        minWidth: 200,
    },
    button: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectButton: {
        backgroundColor: '#EF4444', // Rojo para rechazar
    },
    acceptButton: {
        backgroundColor: '#10B981', // Verde para aceptar
    },
});