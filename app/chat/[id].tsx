// app/chat/[id].tsx

import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// 💡 Hook de Expo Router para obtener parámetros dinámicos
import { useLocalSearchParams } from 'expo-router'; 
// 💡 Contexto de WebRTC
import { useWebRTCContext } from '../../src/context/WebRTCContext'; 
import { Video, Phone } from 'lucide-react-native'; // Iconos para llamar

export default function ChatDetailScreen() {
    // 1. Obtener parámetros de la URL (ruta dinámica)
    const params = useLocalSearchParams();
    const partnerId = params.id as string;
    const partnerUsername = params.name as string; // Parámetro pasado por el query string

    // 2. Obtener funciones de llamada del contexto
    const { handleStartCall, isInCall, isCalling } = useWebRTCContext() as any; 

    // 3. Función para iniciar la llamada
    const handleVideoCall = () => {
        if (!handleStartCall) {
            Alert.alert("Error", "La función de llamada no está disponible.");
            return;
        }

        if (isInCall || isCalling) return; 
        
        handleStartCall({ 
            partnerId: partnerId, 
            partnerUsername: partnerUsername, 
            type: 'video' 
        });
    };

    const handleAudioCall = () => {
        if (!handleStartCall) {
            Alert.alert("Error", "La función de llamada no está disponible.");
            return;
        }

        if (isInCall || isCalling) return;
        
        handleStartCall({ 
            partnerId: partnerId, 
            partnerUsername: partnerUsername, 
            type: 'audio' 
        });
    };
    return (
        <View style={styles.container}>
            
            <View style={styles.headerButtons}>
                {/* Botón de Videollamada */}
                <TouchableOpacity 
                    style={[styles.callButton, styles.videoButton]}
                    onPress={handleVideoCall}
                    disabled={isInCall || isCalling}
                >
                    <Video color="white" size={24} />
                    <Text style={styles.buttonText}>Video</Text>
                </TouchableOpacity>

                {/* Botón de Llamada de Audio */}
                <TouchableOpacity 
                    style={[styles.callButton, styles.audioButton]}
                    onPress={handleAudioCall}
                    disabled={isInCall || isCalling}
                >
                    <Phone color="white" size={24} />
                    <Text style={styles.buttonText}>Audio</Text>
                </TouchableOpacity>
            </View>

            {/* Placeholder para la interfaz de chat (mensajes) */}
            <View style={styles.chatArea}>
                <Text style={styles.chatTitle}>Chat con {partnerUsername}</Text>
                <Text style={styles.chatSubtitle}>ID: {partnerId}</Text>
                <Text style={styles.chatPlaceholder}>Aquí iría tu lista de mensajes...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginLeft: 10,
    },
    videoButton: {
        backgroundColor: '#EF4444', // Rojo
    },
    audioButton: {
        backgroundColor: '#10B981', // Verde
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    chatArea: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    chatTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    chatSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
    },
    chatPlaceholder: {
        marginTop: 50,
        color: '#9CA3AF',
    }
});