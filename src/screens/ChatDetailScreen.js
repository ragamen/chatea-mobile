// src/screens/ChatDetailScreen.js (CORREGIDO)

import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    StyleSheet, 
    Alert, 
    Platform, 
    KeyboardAvoidingView,
    TouchableOpacity 
} from 'react-native';
import { Paperclip, Phone, Video } from 'lucide-react-native'; // Añadimos los iconos para las llamadas
import MessageInput from '../components/MessageInput'; 
import MessageBubble from '../components/MessageBubble'; 
import useChat from '../hooks/useChat'; 
import useFileUploader from '../hooks/useFileUploader'; 

const ChatDetailScreen = ({ 
    route, 
    navigation, 
    userProfile, 
    socket, 
    // Props de WebRTC inyectadas desde App.js
    incomingCall, 
    handleStartCall, 
    handleAcceptCall, 
    endCall,
    currentCall,
}) => {
    const activeChat = route.params.partner; 

    // ----------------------------------------------------
    // LÓGICA DE CHAT
    // ----------------------------------------------------
    const { 
        messages, 
        sendMessage, 
        isLoading, 
        loadMoreMessages 
    } = useChat({
        socket,
        userProfile,
        chatId: activeChat.chat_id,
        partnerId: activeChat.id,
    });
    
    // ----------------------------------------------------
    // LÓGICA DE ARCHIVOS
    // ----------------------------------------------------
    const { 
        pickFile, 
        uploadFileAndSendMessage 
    } = useFileUploader({
        socket,
        userProfile,
        activeChat: activeChat,
    });

    const handleCombinedSend = useCallback(async (content) => {
        if (!content.trim()) return;
        sendMessage(content);
    }, [sendMessage]);

    const handleAttachFile = useCallback(async () => {
        const pickedFile = await pickFile();
        if (pickedFile) {
            await uploadFileAndSendMessage(pickedFile);
        }
    }, [pickFile, uploadFileAndSendMessage]);

    // ----------------------------------------------------
    // Renderizado y Efectos
    // ----------------------------------------------------

    useEffect(() => {
        // Configura la cabecera con el nombre del amigo y los botones de llamada
        navigation.setOptions({
            title: activeChat.username,
            headerRight: () => (
                <View style={styles.headerButtons}>
                    {/* Botón de Video Llamada */}
                    <TouchableOpacity 
                        onPress={() => handleStartCall({ 
                            partnerId: activeChat.id, 
                            partnerUsername: activeChat.username, 
                            type: 'video' 
                        })}
                        style={{ marginRight: 15 }}
                    >
                        <Video color="#4F46E5" size={24} />
                    </TouchableOpacity>
                    {/* Botón de Audio Llamada */}
                    <TouchableOpacity 
                        onPress={() => handleStartCall({ 
                            partnerId: activeChat.id, 
                            partnerUsername: activeChat.username, 
                            type: 'audio' 
                        })}
                    >
                        <Phone color="#4F46E5" size={24} />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, activeChat, handleStartCall]);

    const renderMessage = useCallback(({ item }) => (
        <MessageBubble 
            message={item} 
            isMe={item.sender_id === userProfile.id} 
        />
    ), [userProfile.id]);

    // Lógica para mostrar el banner de llamada
    const isCallBannerVisible = 
        incomingCall && 
        incomingCall.partnerId === activeChat.id &&
        !currentCall; // Solo si hay una llamada entrante y no estamos ya en una

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} 
        >
            {/* Área de Mensajes */}
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                style={styles.messagesList}
                inverted
                contentContainerStyle={styles.messagesContent}
            />
            
            {/* Barra de Entrada de Mensajes */}
            <MessageInput 
                onSend={handleCombinedSend}
                onFilePress={handleAttachFile} 
                onCameraPress={() => Alert.alert("Cámara", "Implementar la captura de foto/video aquí...")} 
            />
            
            {/* 💡 Lógica de la Llamada Entrante (Banner) - REINSERTADA */}
            {isCallBannerVisible && (
                <View style={styles.incomingCallBanner}>
                    <Text style={styles.incomingCallText}>
                        Llamada de {incomingCall.partnerUsername} ({incomingCall.type === 'video' ? 'Video' : 'Voz'})
                    </Text>
                    <View style={styles.incomingCallActions}>
                        <TouchableOpacity 
                            onPress={() => handleAcceptCall(incomingCall)} 
                            style={[styles.callButton, styles.acceptButton]}
                        >
                            <Text style={styles.buttonText}>Aceptar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            // Nota: `endCall` en este contexto rechaza la llamada entrante
                            onPress={endCall} 
                            style={[styles.callButton, styles.rejectButton]}
                        >
                            <Text style={styles.buttonText}>Rechazar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

        </KeyboardAvoidingView>
    );
};

// ----------------------------------------------------
// Estilos (Se mantienen como en el paso anterior)
// ----------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: 10,
    },
    headerButtons: {
        flexDirection: 'row',
    },
    callButtonText: {
        fontSize: 20,
    },
    incomingCallBanner: {
        position: 'absolute',
        bottom: 70, 
        left: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'column',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 8,
    },
    incomingCallText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#1F2937',
    },
    incomingCallActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    callButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: '45%',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#10B981',
    },
    rejectButton: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default ChatDetailScreen;